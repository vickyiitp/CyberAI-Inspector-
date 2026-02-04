#!/bin/bash

echo "=========================================="
echo " CyberAI Inspector - Internet Deployment"
echo "=========================================="
echo

echo "Starting Backend Server..."
cd backend
python main_simple.py &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "=========================================="
echo "Both servers are running!"
echo
echo "Backend PID: $BACKEND_PID (http://localhost:8000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:3000)"
echo
echo "For internet access, forward both ports using:"
echo "- GitHub Codespaces (automatic)"
echo "- ngrok: 'ngrok http 3000' & 'ngrok http 8000'"
echo "- localhost.run: 'ssh -R 80:localhost:3000 localhost.run'"
echo
echo "The application will automatically detect the backend!"
echo
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to stop
wait