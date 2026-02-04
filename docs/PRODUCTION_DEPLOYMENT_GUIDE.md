# 🚀 CyberAI Inspector - Production Deployment Guide

This guide explains how to deploy the application in a production-ready configuration where the Backend (FastAPI) serves the Frontend (React/Vite).

## 🏗️ Architecture Change
In this consolidated mode:
1. **Frontend** is built into static files (`frontend/dist`).
2. **Backend** (`backend/main.py`) serves these static files at the root URL `/`.
3. **API** is accessible at `/api` (or directly via endpoints like `/analyze-url`).
4. **Single Port**: The entire application runs on port `8000` (or configured port).

## 💻 Local Production Test
To test the production build locally:

### Windows
Run the automated script:
```cmd
scripts\deploy-production.bat
```

### Linux / Mac / Codespaces
Run the shell script:
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## ☁️ Cloud Deployment (Azure App Service)

### Prerequisites
- Azure CLI installed (`az login`)
- An Azure subcription

### deployment Steps
1. **Prepare the Repository**:
   Ensure your `.gitignore` does NOT exclude `frontend/dist` if you plan to commit the build, OR ensure your build pipeline builds the frontend.
   *Recommended*: Use a `startup.sh` or build pipeline.

2. **Build Locally (if not using pipeline)**:
   ```bash
   cd frontend
   npm run build
   # This creates frontend/dist
   ```

3. **Deploy to Azure**:
   You can deploy the `backend` folder as the root, but it needs access to `frontend/dist`.
   
   **Best Practice Structure for App Service**:
   Deploy the ROOT of the repo.
   
   **Startup Command**:
   ```bash
   python backend/main.py
   ```
   *Note: Ensure python command works or use `uvicorn backend.main:app --host 0.0.0.0 --port 8000`*

4. **Environment Variables**:
   Set these in Azure App Service Configuration:
   - `GEMINI_API_KEY`: Your Gemini Key
   - `AZURE_COMPUTER_VISION_KEY`: (If used)
   - `AZURE_CONTENT_SAFETY_KEY`: (If used)
   - `AZURE_TEXT_ANALYTICS_KEY`: (If used)

## 🐳 Docker Deployment (Alternative)
Create a `Dockerfile` in the root:

```dockerfile
# Build Frontend
FROM node:18 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Setup Backend
FROM python:3.9
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

CMD ["python", "main.py"]
```
