#!/usr/bin/env node
/**
 * EQInt Savvy - Full Application Startup Script (Cross-platform)
 * This script starts both the HCM AI Python backend (port 8080) 
 * and the eqint-savvy-desktop Node.js backend (port 4000),
 * then launches the Electron desktop app.
 */

const { spawn, execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const os = require('os');

const ROOT_DIR = __dirname;
const DESKTOP_DIR = join(ROOT_DIR, 'eqint-savvy-desktop');
const PYTHON_DIR = join(ROOT_DIR, 'hcm-ai-agent');
const IS_WINDOWS = os.platform() === 'win32';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
}

function warning(message) {
  console.warn(`${colors.yellow}WARNING: ${message}${colors.reset}`);
}

function runCommand(command, cwd, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd: cwd || ROOT_DIR,
      stdio: options.stdio || 'inherit',
      shell: IS_WINDOWS,
      env: { ...process.env, ...options.env }
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}: ${command}`));
    });
  });
}

function runBackground(command, cwd, name) {
  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, {
    cwd: cwd || ROOT_DIR,
    stdio: 'inherit',
    shell: IS_WINDOWS,
    detached: true
  });

  child.unref();
  log(`Started ${name} (PID: ${child.pid})`, 'gray');
  return child;
}

async function checkPrerequisites() {
  log('[1/5] Checking prerequisites...', 'yellow');

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    log(`  Node.js: ${nodeVersion}`, 'green');
  } catch {
    error('Node.js not found in PATH. Please install Node.js 18+ from https://nodejs.org/');
    process.exit(1);
  }

  // Check Python
  try {
    const pythonCmd = IS_WINDOWS ? 'python --version' : 'python3 --version';
    const pythonVersion = execSync(pythonCmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
    log(`  Python: ${pythonVersion}`, 'green');
  } catch {
    error('Python not found in PATH. Please install Python 3.11+ from https://python.org/');
    process.exit(1);
  }

  // Check Docker
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    log(`  Docker: ${dockerVersion}`, 'green');
    return true;
  } catch {
    warning('Docker not found - you\'ll need to run PostgreSQL (5432) and Redis (6379) manually');
    return false;
  }
}

async function startInfrastructure(hasDocker) {
  log('[2/5] Starting infrastructure services (PostgreSQL & Redis)...', 'yellow');

  if (hasDocker && existsSync(join(DESKTOP_DIR, 'backend', 'docker-compose.yml'))) {
    try {
      await runCommand('docker-compose up -d', join(DESKTOP_DIR, 'backend'));
      log('  PostgreSQL & Redis started', 'green');
    } catch {
      warning('docker-compose failed. Make sure PostgreSQL (5432) and Redis (6379) are running.');
    }
  } else {
    log('  Skipping Docker (not available or docker-compose.yml not found)', 'gray');
  }
}

async function setupPythonBackend() {
  log('[3/5] Setting up HCM AI Python backend...', 'yellow');

  const venvDir = join(PYTHON_DIR, IS_WINDOWS ? 'venv' : 'venv');
  const pythonCmd = IS_WINDOWS ? join(venvDir, 'Scripts', 'python.exe') : join(venvDir, 'bin', 'python');
  const pipCmd = IS_WINDOWS ? join(venvDir, 'Scripts', 'pip.exe') : join(venvDir, 'bin', 'pip');

  // Create virtual environment if it doesn't exist
  if (!existsSync(venvDir)) {
    log('  Creating Python virtual environment...');
    try {
      await runCommand(`${IS_WINDOWS ? 'python' : 'python3'} -m venv venv`, PYTHON_DIR);
    } catch {
      error('Failed to create virtual environment');
      process.exit(1);
    }
  }

  // Install dependencies
  log('  Installing Python dependencies...');
  try {
    await runCommand(`${pipCmd} install --upgrade pip`, PYTHON_DIR, { stdio: 'pipe' });
    await runCommand(`${pipCmd} install -r requirements.txt`, PYTHON_DIR, { stdio: 'pipe' });
  } catch {
    warning('Some Python packages failed to install');
  }

  // Check for .env file
  if (!existsSync(join(PYTHON_DIR, '.env'))) {
    warning('.env file not found in hcm-ai-agent!');
    log('  Copy .env.example to .env and configure your Oracle HCM credentials.', 'yellow');
  }

  return pythonCmd;
}

async function setupDesktopBackend() {
  log('[4/5] Setting up eqint-savvy-desktop Node.js backend...', 'yellow');

  // Install root dependencies
  log('  Installing root dependencies...');
  try {
    await runCommand('npm install', DESKTOP_DIR, { stdio: 'pipe' });
  } catch {
    warning('Root npm install had issues');
  }

  // Install backend API dependencies
  const apiDir = join(DESKTOP_DIR, 'backend', 'services', 'api');
  log('  Installing backend API dependencies...');
  try {
    await runCommand('npm install', apiDir, { stdio: 'pipe' });
    await runCommand('npx prisma generate', apiDir, { stdio: 'pipe' });
    await runCommand('npx prisma migrate deploy', apiDir, { stdio: 'pipe' });
  } catch {
    warning('Backend API setup had issues');
  }
}

async function startServices(pythonCmd) {
  log('[5/5] Starting application services...', 'yellow');

  const processes = [];

  // Start HCM AI Python backend
  log('  Starting HCM AI Python backend (port 8080)...', 'cyan');
  const pythonProcess = runBackground(
    `${pythonCmd} -m uvicorn src.api.server:app --host 0.0.0.0 --port 8080 --reload`,
    PYTHON_DIR,
    'HCM AI Python Backend'
  );
  processes.push({ name: 'HCM AI Python Backend', pid: pythonProcess.pid, port: 8080 });

  // Wait for Python backend
  log('  Waiting for Python backend to start...', 'gray');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start eqint-savvy-desktop Node.js backend
  log('  Starting eqint-savvy-desktop Node.js backend (port 4000)...', 'cyan');
  const apiDir = join(DESKTOP_DIR, 'backend', 'services', 'api');
  const nodeProcess = runBackground('npm run dev', apiDir, 'Savvy Node.js Backend');
  processes.push({ name: 'Savvy Node.js Backend', pid: nodeProcess.pid, port: 4000 });

  // Wait for Node.js backend
  log('  Waiting for Node.js backend to start...', 'gray');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start Electron desktop app
  log('  Starting Electron desktop app...', 'cyan');
  try {
    await runCommand('npm run prestart', DESKTOP_DIR, { stdio: 'pipe' });
  } catch {
    warning('prestart had issues, continuing...');
  }

  const electronProcess = runBackground('npm start', DESKTOP_DIR, 'EQInt Savvy Desktop');
  processes.push({ name: 'EQInt Savvy Desktop', pid: electronProcess.pid });

  return processes;
}

async function main() {
  log('============================================', 'cyan');
  log('EQInt Savvy - Full Application Launcher', 'cyan');
  log('============================================', 'cyan');
  log('');

  // Verify we're in the right directory
  if (!existsSync(DESKTOP_DIR) || !existsSync(PYTHON_DIR)) {
    error('Submodule directories not found!');
    log('Please run: git submodule update --init --recursive', 'yellow');
    log('Or clone with: git clone --recurse-submodules <repo-url>', 'yellow');
    process.exit(1);
  }

  try {
    const hasDocker = await checkPrerequisites();
    await startInfrastructure(hasDocker);
    const pythonCmd = await setupPythonBackend();
    await setupDesktopBackend();
    const processes = await startServices(pythonCmd);

    log('');
    log('============================================', 'cyan');
    log('All services started!', 'green');
    log('============================================', 'cyan');
    log('');
    log('HCM AI Python Backend:  http://localhost:8080', 'cyan');
    log('Savvy Node.js Backend:  http://localhost:4000', 'cyan');
    log('Electron App:           Running in separate window', 'cyan');
    log('');
    log('Process IDs:', 'gray');
    processes.forEach(p => {
      log(`  ${p.name} (PID: ${p.pid})${p.port ? ` - Port ${p.port}` : ''}`, 'gray');
    });
    log('');
    log('Press Ctrl+C in the console windows to stop services.', 'yellow');
    log('');

    // Keep the script running
    await new Promise(() => {});
  } catch (err) {
    error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

main();