#!/bin/bash

# CyberAI Inspector Backend Startup Script

echo "Starting CyberAI Inspector Backend..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Navigate to backend directory
cd ../backend

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start the backend server
echo "Starting FastAPI backend on http://localhost:8000"
python main.py