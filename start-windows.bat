@echo off
REM EQInt Savvy - Full Application Startup Script for Windows
REM This script starts both the HCM AI Python backend (port 8080) 
REM and the eqint-savvy-desktop Node.js backend (port 4000),
REM then launches the Electron desktop app.

echo ============================================
echo EQInt Savvy - Full Application Launcher
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "eqint-savvy-desktop" (
    echo ERROR: eqint-savvy-desktop folder not found!
    echo Please run this script from the eqint-savvy-full root directory.
    pause
    exit /b 1
)

if not exist "hcm-ai-agent" (
    echo ERROR: hcm-ai-agent folder not found!
    echo Please run this script from the eqint-savvy-full root directory.
    pause
    exit /b 1
)

echo [1/5] Checking prerequisites...

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo   Node.js: OK

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found in PATH
    echo Please install Python 3.11+ from https://python.org/
    pause
    exit /b 1
)
echo   Python: OK

REM Check for Docker (optional, for PostgreSQL/Redis)
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Docker not found - you'll need to run PostgreSQL and Redis manually
) else (
    echo   Docker: OK
)

echo.
echo [2/5] Starting infrastructure services (PostgreSQL & Redis)...
cd eqint-savvy-desktop\backend
if exist docker-compose.yml (
    docker-compose up -d
    if %errorlevel% neq 0 (
        echo WARNING: docker-compose failed. Make sure PostgreSQL (5432) and Redis (6379) are running.
    ) else (
        echo   PostgreSQL & Redis started
    )
) else (
    echo WARNING: docker-compose.yml not found. Starting services manually...
)
cd ..\..

echo.
echo [3/5] Setting up HCM AI Python backend...
cd hcm-ai-agent

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo   Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment and install dependencies
echo   Installing Python dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Some Python packages failed to install
)

REM Check for .env file
if not exist .env (
    echo WARNING: .env file not found in hcm-ai-agent!
    echo Copy .env.example to .env and configure your Oracle HCM credentials.
)
cd ..

echo.
echo [4/5] Setting up eqint-savvy-desktop Node.js backend...
cd eqint-savvy-desktop

echo   Installing root dependencies...
npm install >nul 2>&1

echo   Installing backend API dependencies...
cd backend\services\api
npm install >nul 2>&1
npx prisma generate >nul 2>&1
npx prisma migrate deploy >nul 2>&1
cd ..\..\..

echo.
echo [5/5] Starting application services...

echo Starting HCM AI Python backend (port 8080)...
cd hcm-ai-agent
call venv\Scripts\activate.bat
start "HCM AI Backend" cmd /k "python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8080 --reload"
cd ..

echo Waiting for Python backend to start...
timeout /t 5 /nobreak >nul

echo Starting eqint-savvy-desktop Node.js backend (port 4000)...
cd eqint-savvy-desktop\backend\services\api
start "Savvy API Backend" cmd /k "npm run dev"
cd ..\..\..

echo Waiting for Node.js backend to start...
timeout /t 5 /nobreak >nul

echo Starting Electron desktop app...
cd eqint-savvy-desktop
npm run prestart >nul 2>&1
start "EQInt Savvy Desktop" cmd /k "npm start"
cd ..

echo.
echo ============================================
echo All services started!
echo ============================================
echo.
echo HCM AI Python Backend:  http://localhost:8080
echo Savvy Node.js Backend:  http://localhost:4000
echo Electron App:           Running in separate window
echo.
echo Press Ctrl+C in the console windows to stop services.
echo.
pause