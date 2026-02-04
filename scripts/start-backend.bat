@echo off

REM CyberAI Inspector Backend Startup Script for Windows

echo Starting CyberAI Inspector Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd ..\backend

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Start the backend server
echo Starting FastAPI backend on http://localhost:8001
python main.py

pause