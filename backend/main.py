from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

from analyzers import url_analyzer, text_analyzer, image_analyzer

app = FastAPI(title="CyberAI Inspector Backend", version="1.0.0")

# Allow requests from the frontend dev server and forwarded ports
import os

def get_allowed_origins():
    """Get allowed origins for CORS, including forwarded port domains"""
    # Default localhost origins
    origins = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:8080"
    ]
    
    # Add any custom origins from environment variable
    custom_origins = os.getenv("ALLOWED_ORIGINS", "")
    if custom_origins:
        origins.extend(custom_origins.split(","))
    
    return origins

# For development and forwarded ports, allow all origins
# In production, you should specify exact domains
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins = get_allowed_origins()
else:
    # For development and forwarded ports, allow all origins
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UrlRequest(BaseModel):
    url: str


class TextRequest(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "CyberAI Inspector Backend API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint for debugging connectivity"""
    return {
        "status": "healthy",
        "message": "Backend server is running",
        "timestamp": "2024-10-24",
        "cors_origins": "All origins allowed in development mode"
    }


@app.post("/analyze-url/")
async def analyze_url_endpoint(req: UrlRequest) -> Any:
    try:
        result = await url_analyzer.analyze_url(req.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-text/")
async def analyze_text_endpoint(req: TextRequest) -> Any:
    try:
        result = await text_analyzer.analyze_text(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-image/")
async def analyze_image_endpoint(file: UploadFile = File(...)) -> Any:
    content = await file.read()
    try:
        result = await image_analyzer.analyze_image(content, filename=file.filename or "upload.jpg")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)