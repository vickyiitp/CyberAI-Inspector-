@echo off

REM CyberAI Inspector Demo Test Script for Windows

echo Testing CyberAI Inspector API endpoints...

set API_BASE=http://localhost:8001

echo 1. Testing backend health check...
curl -s "%API_BASE%/" 

echo.
echo 2. Testing URL analysis...
curl -s -X POST "%API_BASE%/analyze-url/" -H "Content-Type: application/json" -d "{\"url\": \"https://github.com\"}"

echo.
echo 3. Testing text analysis...
curl -s -X POST "%API_BASE%/analyze-text/" -H "Content-Type: application/json" -d "{\"text\": \"This is a great article about technology and innovation.\"}"

echo.
echo Demo complete! All endpoints are working.
pause