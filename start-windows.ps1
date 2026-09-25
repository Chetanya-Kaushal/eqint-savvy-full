# EQInt Savvy - Full Application Startup Script for Windows (PowerShell)
# This script starts both the HCM AI Python backend (port 8080) 
# and the eqint-savvy-desktop Node.js backend (port 4000),
# then launches the Electron desktop app.

param(
    [switch]$SkipDocker,
    [switch]$SkipInstall,
    [switch]$DevMode
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "EQInt Savvy - Full Application Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "eqint-savvy-desktop")) {
    Write-Error "ERROR: eqint-savvy-desktop folder not found!"
    Write-Host "Please run this script from the eqint-savvy-full root directory."
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "hcm-ai-agent")) {
    Write-Error "ERROR: hcm-ai-agent folder not found!"
    Write-Host "Please run this script from the eqint-savvy-full root directory."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "ERROR: Node.js not found in PATH"
    Write-Host "Please install Node.js 18+ from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for Python
try {
    $pythonVersion = python --version
    Write-Host "   Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "ERROR: Python not found in PATH"
    Write-Host "Please install Python 3.11+ from https://python.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for Docker
try {
    $dockerVersion = docker --version
    Write-Host "   Docker: $dockerVersion" -ForegroundColor Green
    $hasDocker = $true
} catch {
    Write-Warning "WARNING: Docker not found - you'll need to run PostgreSQL (5432) and Redis (6379) manually"
    $hasDocker = $false
}

Write-Host ""
Write-Host "[2/5] Starting infrastructure services (PostgreSQL & Redis)..." -ForegroundColor Yellow

if (-not $SkipDocker -and $hasDocker) {
    Set-Location "eqint-savvy-desktop\backend"
    if (Test-Path "docker-compose.yml") {
        Write-Host "   Starting PostgreSQL & Redis via Docker Compose..."
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "   docker-compose failed. Make sure PostgreSQL (5432) and Redis (6379) are running."
        } else {
            Write-Host "   PostgreSQL & Redis started" -ForegroundColor Green
        }
    } else {
        Write-Warning "   docker-compose.yml not found. Starting services manually..."
    }
    Set-Location "..\.."
} else {
    Write-Host "   Skipping Docker (use -SkipDocker to suppress this message)"
}

Write-Host ""
Write-Host "[3/5] Setting up HCM AI Python backend..." -ForegroundColor Yellow

Set-Location "hcm-ai-agent"

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "   Creating Python virtual environment..."
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ERROR: Failed to create virtual environment"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

if (-not $SkipInstall) {
    Write-Host "   Installing Python dependencies..."
    & .\venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip -q
    pip install -r requirements.txt -q
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "   Some Python packages failed to install"
    }
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Warning "   .env file not found in hcm-ai-agent!"
    Write-Host "   Copy .env.example to .env and configure your Oracle HCM credentials." -ForegroundColor Yellow
}

Set-Location ".."

Write-Host ""
Write-Host "[4/5] Setting up eqint-savvy-desktop Node.js backend..." -ForegroundColor Yellow

Set-Location "eqint-savvy-desktop"

if (-not $SkipInstall) {
    Write-Host "   Installing root dependencies..."
    npm install --silent

    Write-Host "   Installing backend API dependencies..."
    Set-Location "backend\services\api"
    npm install --silent
    npx prisma generate --silent
    npx prisma migrate deploy --silent
    Set-Location "..\..\.."
}

Set-Location ".."

Write-Host ""
Write-Host "[5/5] Starting application services..." -ForegroundColor Yellow

$processes = @()

# Start HCM AI Python backend
Write-Host "   Starting HCM AI Python backend (port 8080)..."
$pythonProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd hcm-ai-agent && venv\Scripts\activate.bat && python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8080 --reload" -WindowStyle Normal -PassThru
$processes += $pythonProcess

# Wait for Python backend
Write-Host "   Waiting for Python backend to start..."
Start-Sleep -Seconds 5

# Start eqint-savvy-desktop Node.js backend
Write-Host "   Starting eqint-savvy-desktop Node.js backend (port 4000)..."
$nodeProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd eqint-savvy-desktop\backend\services\api && npm run dev" -WindowStyle Normal -PassThru
$processes += $nodeProcess

# Wait for Node.js backend
Write-Host "   Waiting for Node.js backend to start..."
Start-Sleep -Seconds 5

# Start Electron desktop app
Write-Host "   Starting Electron desktop app..."
Set-Location "eqint-savvy-desktop"
npm run prestart -s
$electronProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "npm start" -WindowStyle Normal -PassThru
$processes += $electronProcess
Set-Location ".."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "All services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "HCM AI Python Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Savvy Node.js Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Electron App:           Running in separate window" -ForegroundColor Cyan
Write-Host ""
Write-Host "Process IDs:" -ForegroundColor Gray
foreach ($p in $processes) {
    Write-Host "  $($p.ProcessName) (PID: $($p.Id))" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Press Ctrl+C in the console windows to stop services." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"