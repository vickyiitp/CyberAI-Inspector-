"""
CyberAI Inspector Backend - Real Analysis Version
Uses actual analysis libraries instead of mock responses
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from analyzers.image_analyzer import analyze_image
from analyzers.url_analyzer import analyze_url
from analyzers.text_analyzer import analyze_text


app = FastAPI(title="CyberAI Inspector API", version="2.0.0")

# Configure CORS for internet deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class UrlRequest(BaseModel):
    url: str


class TextRequest(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "CyberAI Inspector Backend API - Real Analysis", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint for debugging connectivity"""
    return {
        "status": "healthy",
        "message": "Backend server is running with real analysis",
        "timestamp": "2024-10-24",
        "cors_origins": "All origins allowed in development mode"
    }


@app.post("/analyze-url/")
async def analyze_url_endpoint(req: UrlRequest):
    """Analyze URL using real security and privacy analysis"""
    try:
        print(f"Analyzing URL: {req.url}")
        result = await analyze_url(req.url)
        print(f"URL analysis completed with trust score: {result.get('trustScore', 'unknown')}")
        return result
    except Exception as e:
        print(f"Error analyzing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")


@app.post("/analyze-text/")
async def analyze_text_endpoint(req: TextRequest):
    """Analyze text using real NLP and bias detection"""
    try:
        print(f"Analyzing text ({len(req.text)} characters)")
        result = await analyze_text(req.text)
        print(f"Text analysis completed with trust score: {result.get('trustScore', 'unknown')}")
        return result
    except Exception as e:
        print(f"Error analyzing text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")


@app.post("/analyze-image/")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """Analyze image using real computer vision and metadata extraction"""
    try:
        print(f"Analyzing image: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        # Analyze using real image processing
        result = await analyze_image(content, file.filename or "upload.jpg")
        print(f"Image analysis completed with trust score: {result.get('trustScore', 'unknown')}")
        return result
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


if __name__ == "__main__":
    print("🚀 Starting CyberAI Inspector Backend with Real Analysis...")
    print("📊 Using actual libraries for:")
    print("   • Image Analysis: OpenCV, PIL, EXIF extraction")
    print("   • URL Analysis: Security headers, SSL, WHOIS, privacy policies")
    print("   • Text Analysis: NLTK, TextBlob, sentiment analysis, bias detection")
    print("🌐 CORS enabled for all origins")
    print("🔗 Health check: http://localhost:8000/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )