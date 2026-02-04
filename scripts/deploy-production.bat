@echo off
echo ===========================================
echo   CyberAI Inspector - Production Deploy
echo ===========================================

echo [1/3] Building Frontend...
cd frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo [2/3] Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend dependency install failed!
    pause
    exit /b %errorlevel%
)

echo [3/3] Starting Production Server...
echo The app will be available at http://localhost:8000
echo Serving static files from ../frontend/dist

python main.py
pause
