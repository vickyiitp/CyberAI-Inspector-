# CyberAI Inspector - Internet Deployment Guide

## Quick Start for Internet Deployment

### Method 1: Using Port Forwarding Services (Recommended)

#### Option A: GitHub Codespaces
1. Open this repository in GitHub Codespaces
2. Run both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python main_simple.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```
3. Codespaces will automatically forward ports 3000 and 8000
4. Access the forwarded port 3000 URL
5. The app automatically detects and connects to the backend

#### Option B: ngrok (Free)
1. Install ngrok: https://ngrok.com/download
2. Start both servers locally:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python main_simple.py
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   
   # Terminal 3 - Expose frontend
   ngrok http 3000
   
   # Terminal 4 - Expose backend
   ngrok http 8000
   ```
3. Use the ngrok HTTPS URL for the frontend
4. The app will automatically detect the backend

#### Option C: localhost.run (Free, No Installation)
1. Start both servers locally
2. In new terminals, run:
   ```bash
   # Expose frontend
   ssh -R 80:localhost:3000 localhost.run
   
   # Expose backend
   ssh -R 80:localhost:8000 localhost.run
   ```
3. Use the provided URLs

### Method 2: Manual Configuration

If automatic detection fails, you can manually configure the backend URL:

1. Create `frontend/.env` file:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

2. Start the servers:
   ```bash
   cd backend && python main_simple.py
   cd frontend && npm run dev
   ```

### Method 3: Production Deployment

#### Using Docker (Recommended for Production)
1. Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "8000:8000"
       environment:
         - ENVIRONMENT=production
     
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       environment:
         - VITE_API_BASE_URL=http://your-domain.com:8000
   ```

2. Run: `docker-compose up`

#### Using Cloud Platforms

**Vercel (Frontend) + Railway (Backend):**
1. Deploy backend to Railway
2. Deploy frontend to Vercel with environment variable:
   ```env
   VITE_API_BASE_URL=https://your-railway-backend.railway.app
   ```

**Heroku:**
1. Deploy both as separate apps
2. Configure frontend with backend URL

## Troubleshooting

### Issue: Black Screen After Clicking Analyze

**Symptoms:** 
- Application loads fine
- Clicking "Analyze" on any module shows black screen
- Browser console shows connection errors

**Solutions:**

1. **Check Browser Console (F12):**
   - Look for "Backend: Connected/Disconnected" status
   - Check for CORS errors or network failures
   - Note the detected backend URL

2. **Verify Both Servers Running:**
   - Backend should show: "Uvicorn running on http://0.0.0.0:8000"
   - Frontend should show: "Local: http://localhost:3000"

3. **Test Backend Directly:**
   - Visit: `your-backend-url/health`
   - Should return: `{"status": "healthy"}`

4. **Manual Backend URL Override:**
   ```env
   # frontend/.env
   VITE_API_BASE_URL=https://your-exact-backend-url
   ```

5. **Common Port Forwarding Issues:**
   - Ensure both ports 3000 AND 8000 are forwarded
   - Some services require HTTPS - check URL protocols
   - Try different forwarding services if one doesn't work

### Issue: CORS Errors

**Solution:** The backend is configured to allow all origins in development mode. If you see CORS errors:

1. Check backend logs for CORS-related messages
2. Verify backend is running with `ENVIRONMENT != "production"`
3. For production, add your domain to allowed origins

### Issue: Connection Timeout

**Solution:**
1. Check firewall settings
2. Verify network connectivity
3. Try alternative forwarding service
4. Check backend server logs for errors

## Security Notes

- The current configuration allows all origins for development
- For production deployment, configure specific allowed origins
- Use HTTPS in production
- Consider API authentication for public deployment

## Support

If you continue having issues:
1. Check browser developer console for detailed error messages
2. Share backend and frontend logs
3. Verify your deployment method matches the instructions above