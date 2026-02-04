"""
CyberAI Inspector Backend - Real-Time Web Search Analysis
Uses live web search and fact-checking for accurate analysis
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
from analyzers.image_analyzer import analyze_image
from analyzers.url_analyzer import analyze_url
from realtime_analyzer import analyze_text_with_search


app = FastAPI(title="CyberAI Inspector API - Real-Time Search", version="3.0.0")

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
    return {"message": "CyberAI Inspector Backend API - Real-Time Web Search", "version": "3.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint for debugging connectivity"""
    return {
        "status": "healthy",
        "message": "Backend server running with real-time web search analysis",
        "timestamp": "2024-10-24",
        "cors_origins": "All origins allowed in development mode",
        "analysis_features": {
            "image_analysis": "OpenCV + PIL + EXIF extraction",
            "url_analysis": "Security headers + SSL + WHOIS",
            "text_analysis": "Real-time web search + fact-checking + sentiment analysis"
        }
    }


@app.post("/analyze-url/")
async def analyze_url_endpoint(req: UrlRequest):
    """Analyze URL using real security and privacy analysis"""
    try:
        print(f"🔍 Analyzing URL: {req.url}")
        result = await analyze_url(req.url)
        print(f"✅ URL analysis completed with trust score: {result.get('trustScore', 'unknown')}")
        return result
    except Exception as e:
        print(f"❌ Error analyzing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")


@app.post("/analyze-text/")
async def analyze_text_endpoint(req: TextRequest):
    """Analyze text using real-time web search and fact-checking"""
    try:
        print(f"🔍 Analyzing text with web search ({len(req.text)} characters)")
        print(f"📝 Text preview: {req.text[:100]}...")
        
        result = await analyze_text_with_search(req.text)
        
        print(f"✅ Real-time text analysis completed")
        print(f"📊 Trust score: {result.get('trustScore', 'unknown')}")
        print(f"🔍 Evidence points: {result.get('realtime_analysis', {}).get('total_evidence_points', 0)}")
        
        return result
    except Exception as e:
        print(f"❌ Error analyzing text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")


@app.post("/analyze-image/")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """Analyze image using real computer vision and metadata extraction"""
    try:
        print(f"🔍 Analyzing image: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        # Analyze using real image processing
        result = await analyze_image(content, file.filename or "upload.jpg")
        print(f"✅ Image analysis completed with trust score: {result.get('trustScore', 'unknown')}")
        return result
    except Exception as e:
        print(f"❌ Error analyzing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


if __name__ == "__main__":
    print("🚀 Starting CyberAI Inspector Backend with Real-Time Web Search...")
    print("🌐 Real-Time Analysis Features:")
    print("   🔍 Web Search: Live fact verification using DuckDuckGo")
    print("   📋 Fact Checking: Integration with Snopes, FactCheck.org, Reuters")
    print("   🖼️  Image Analysis: OpenCV, PIL, EXIF metadata extraction")
    print("   🌐 URL Analysis: Security headers, SSL certificates, WHOIS data")
    print("   📝 Text Analysis: Real-time web search + geographic verification")
    print("🌐 CORS enabled for all origins")
    print("🔗 Health check: http://localhost:8000/health")
    print("")
    print("⚡ REAL-TIME FEATURES:")
    print("   • Searches web for fact verification")
    print("   • Checks against fact-checking websites")
    print("   • Verifies geographic claims (e.g., 'Bihar is a state of India')")
    print("   • Cross-references multiple sources")
    print("   • Provides evidence-based trust scores")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )