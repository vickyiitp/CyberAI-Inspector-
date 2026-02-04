@echo off

REM CyberAI Inspector Frontend Startup Script for Windows

echo Starting CyberAI Inspector Frontend...

REM Navigate to frontend directory
cd ..\frontend

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing Node.js dependencies...
npm install

REM Start the development server
echo Starting frontend development server on http://localhost:3000
npm run dev

pause