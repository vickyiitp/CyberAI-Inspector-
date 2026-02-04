#!/bin/bash

echo "==========================================="
echo "  CyberAI Inspector - Production Deploy"
echo "==========================================="

echo "[1/3] Building Frontend..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi
cd ..

echo "[2/3] Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Backend dependency install failed!"
    exit 1
fi

echo "[3/3] Starting Production Server..."
echo "The app will be available at http://localhost:8000"
echo "Serving static files from ../frontend/dist"

python main.py
