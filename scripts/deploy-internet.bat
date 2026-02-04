@echo off
echo ==========================================
echo  CyberAI Inspector - Internet Deployment
echo ==========================================
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /c "python main_simple.py & pause"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /c "npm run dev & pause"

echo.
echo ==========================================
echo Both servers are starting...
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo For internet access, forward both ports using:
echo - GitHub Codespaces (automatic)
echo - ngrok: ngrok http 3000 ^& ngrok http 8000
echo - localhost.run: ssh -R 80:localhost:3000 localhost.run
echo.
echo The application will automatically detect the backend!
echo ==========================================
pause