from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="CyberAI Inspector Backend", version="1.0.0")

# Allow requests from the frontend dev server and forwarded ports
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
async def analyze_url_endpoint(req: UrlRequest):
    try:
        # Mock response matching UrlAnalysisResult interface
        return {
            "trustScore": 75,
            "verdict": "Moderately Trustworthy",
            "domainInfo": [
                {"name": "Domain", "value": req.url},
                {"name": "Age", "value": "5 years"},
                {"name": "Registrar", "value": "GoDaddy"},
                {"name": "Country", "value": "United States"},
                {"name": "IP Address", "value": "192.168.1.1"},
                {"name": "Hosting Provider", "value": "Cloudflare"}
            ],
            "sslInfo": [
                {"name": "Certificate Status", "value": "Valid"},
                {"name": "Issuer", "value": "Let's Encrypt"},
                {"name": "Expiry Date", "value": "2025-01-24"},
                {"name": "Encryption", "value": "TLS 1.3"},
                {"name": "Certificate Type", "value": "Domain Validated"}
            ],
            "backlinkProfile": {
                "total": 1250,
                "reputable": 950
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-text/")
async def analyze_text_endpoint(req: TextRequest):
    try:
        # Mock response matching TextAnalysisResult interface
        return {
            "trustScore": 80,
            "verdict": "Generally Reliable",
            "summary": "This is a test response from the backend server for text analysis",
            "sentiment": "Neutral",
            "sources": [
                {
                    "web": {
                        "uri": "https://example.com/source1",
                        "title": "Example Source 1"
                    }
                },
                {
                    "web": {
                        "uri": "https://example.com/source2", 
                        "title": "Example Source 2"
                    }
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-image/")
async def analyze_image_endpoint():
    try:
        # Mock response matching ImageAnalysisResult interface
        return {
            "trustScore": 85,
            "verdict": "Likely Authentic",
            "analysis": {
                "metadata": [
                    {"name": "File Size", "value": "2.4 MB"},
                    {"name": "Dimensions", "value": "1920x1080"},
                    {"name": "Format", "value": "JPEG"},
                    {"name": "Color Space", "value": "sRGB"},
                    {"name": "Camera Make", "value": "Canon"},
                    {"name": "Camera Model", "value": "EOS R5"},
                    {"name": "Date Taken", "value": "2024-10-24 10:30:45"}
                ],
                "compression": [
                    {"name": "Quality", "value": "85%"},
                    {"name": "Compression Ratio", "value": "12:1"},
                    {"name": "Algorithm", "value": "JPEG Standard"},
                    {"name": "Lossless", "value": "No"}
                ],
                "artifacts": [
                    "Minor JPEG compression artifacts detected",
                    "No digital manipulation signatures found",
                    "Original EXIF data intact",
                    "No suspicious pixel patterns"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)