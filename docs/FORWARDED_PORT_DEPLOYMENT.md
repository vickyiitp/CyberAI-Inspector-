# CyberAI Inspector - Forwarded Port Deployment Guide

## Issue: Black Screen on Forwarded Ports

When deploying through forwarded ports (GitHub Codespaces, VS Code port forwarding, ngrok, etc.), the application may show a black screen because the frontend can't connect to the backend.

## Solution Implemented

### 1. Dynamic API URL Detection
The frontend now automatically detects the deployment environment and adjusts the backend API URL accordingly.

### 2. CORS Configuration
The backend allows all origins in development mode to support various forwarded port scenarios.

### 3. Environment Variable Support
You can override the API URL using environment variables.

## Deployment Steps

### For Local Development:
1. Start backend: `cd backend && python main_simple.py`
2. Start frontend: `cd frontend && npm run dev`
3. Access: `http://localhost:3000`

### For GitHub Codespaces:
1. Start both servers as above
2. Access the forwarded port for frontend (usually port 3000)
3. The frontend will automatically detect and connect to the backend on port 8000

### For VS Code Port Forwarding:
1. Start both servers
2. Forward ports 3000 (frontend) and 8000 (backend) 
3. Access the forwarded frontend URL
4. The application will automatically connect to the correct backend

### For Custom Forwarded Ports:
1. Create `.env` file in frontend directory:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
2. Start the servers
3. The frontend will use your custom backend URL

## Troubleshooting

### Check Browser Console:
Open Developer Tools (F12) and check the Console tab for:
- API connection logs showing the detected backend URL
- Network errors or CORS issues

### Test Backend Connectivity:
- Visit `http://your-backend-url/health` to verify backend is accessible
- Should return: `{"status": "healthy", "message": "Backend server is running"}`

### Common Issues:

1. **CORS Errors**: Backend CORS is configured to allow all origins in development
2. **Port Not Forwarded**: Ensure both ports 3000 and 8000 are forwarded
3. **SSL/HTTPS Issues**: Some forwarding services require HTTPS URLs

### Manual Override:
If automatic detection fails, manually set the API URL in `frontend/.env`:
```
VITE_API_BASE_URL=https://your-exact-backend-url
```

## Current Status

✅ **Fixed Issues:**
- Dynamic API URL detection for various forwarding scenarios
- CORS configuration allows all origins in development
- Environment variable support for manual override
- Comprehensive error handling and logging

✅ **Supported Platforms:**
- GitHub Codespaces
- VS Code Port Forwarding  
- ngrok
- localhost.run
- Cloudflare Tunnel
- Custom forwarding solutions

The application should now work correctly with forwarded ports without showing a black screen.