"""
CyberAI Inspector Backend - Working Real Analysis Version
Uses actual analysis libraries with working imports
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
from analyzers.image_analyzer import analyze_image
from analyzers.url_analyzer import analyze_url
# Simple text analysis without problematic imports
from textblob import TextBlob
import nltk
from typing import Dict, Any


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


def detect_factual_issues(text: str) -> float:
    """Detect potential factual inaccuracies and misinformation patterns"""
    
    # Known factual errors and suspicious patterns
    factual_red_flags = [
        # Geographic errors - Countries falsely claimed as states
        ("india is a state", 0.1),  # India is not a state of any country
        ("china is a state", 0.1),  # China is not a state
        ("russia is a state", 0.1),  # Russia is not a state
        ("france is a state", 0.1),  # France is not a state
        ("germany is a state", 0.1), # Germany is not a state
        ("japan is a state", 0.1),  # Japan is not a state
        ("uk is a state", 0.1),     # UK is not a state
        ("england is a state", 0.1), # England is not a state
        ("brazil is a state", 0.1),  # Brazil is not a state
        ("canada is a state", 0.1),  # Canada is not a state
        
        # Indian states falsely claimed as countries
        ("bihar is a country", 0.1),       # Bihar is an Indian state
        ("uttar pradesh is a country", 0.1), # UP is an Indian state
        ("maharashtra is a country", 0.1),  # Maharashtra is an Indian state
        ("rajasthan is a country", 0.1),    # Rajasthan is an Indian state
        ("gujarat is a country", 0.1),      # Gujarat is an Indian state
        ("punjab is a country", 0.1),       # Punjab is an Indian state (note: there's also Pakistan's Punjab)
        ("haryana is a country", 0.1),      # Haryana is an Indian state
        ("kerala is a country", 0.1),       # Kerala is an Indian state
        ("karnataka is a country", 0.1),    # Karnataka is an Indian state
        ("tamil nadu is a country", 0.1),   # Tamil Nadu is an Indian state
        ("west bengal is a country", 0.1),  # West Bengal is an Indian state
        ("odisha is a country", 0.1),       # Odisha is an Indian state
        ("assam is a country", 0.1),        # Assam is an Indian state
        ("madhya pradesh is a country", 0.1), # MP is an Indian state
        ("jharkhand is a country", 0.1),    # Jharkhand is an Indian state
        ("chhattisgarh is a country", 0.1), # Chhattisgarh is an Indian state
        
        # States falsely claimed as not being states
        ("bihar is not", 0.2),              # Denying Bihar is a state
        ("uttar pradesh is not", 0.2),      # Denying UP is a state
        ("maharashtra is not", 0.2),        # Denying Maharashtra is a state
        ("rajasthan is not", 0.2),          # Denying Rajasthan is a state
        ("gujarat is not", 0.2),            # Denying Gujarat is a state
        ("texas is not a state", 0.1),      # Texas is a US state
        ("california is not a state", 0.1), # California is a US state
        ("florida is not a state", 0.1),    # Florida is a US state
        
        # US states falsely claimed as countries
        ("texas is a country", 0.1),        # Texas is a US state
        ("california is a country", 0.1),   # California is a US state
        ("florida is a country", 0.1),      # Florida is a US state
        ("new york is a country", 0.1),     # New York is a US state
        
        # Historical errors
        ("world war 2 started in 1950", 0.1),
        ("world war 1 started in 1920", 0.1),
        ("america was discovered in 1600", 0.1),
        ("independence in 1950", 0.2),      # India got independence in 1947
        ("independence in 1946", 0.2),      # India got independence in 1947
        
        # Scientific errors
        ("earth is flat", 0.1),
        ("sun revolves around earth", 0.1),
        ("vaccines cause autism", 0.2),
        ("climate change is fake", 0.2),
        
        # Mathematical impossibilities
        ("2+2=5", 0.1),
        ("1+1=3", 0.1),
        
        # Conspiracy theories keywords
        ("bill gates controls", 0.3),
        ("illuminati controls", 0.2),
        ("lizard people", 0.2),
        ("flat earth", 0.2),
        ("chemtrails", 0.3),
        ("fake moon landing", 0.3),
        
        # Absolute false statements patterns
        ("never happened", 0.4),
        ("completely false", 0.4),
        ("total lie", 0.4),
        ("100% fake", 0.3),
        ("proven fake", 0.4),
    ]
    
    # Suspicious language patterns
    suspicious_patterns = [
        ("they don't want you to know", 0.4),
        ("secret government", 0.4),
        ("hidden truth", 0.4),
        ("mainstream media lies", 0.4),
        ("wake up sheeple", 0.3),
        ("do your own research", 0.5),  # Often used to spread misinformation
        ("big pharma", 0.4),
        ("deep state", 0.4),
        ("new world order", 0.3),
    ]
    
    # Quality indicators (these increase trust)
    quality_indicators = [
        ("according to research", 0.8),
        ("studies show", 0.8),
        ("peer reviewed", 0.9),
        ("scientific evidence", 0.9),
        ("published in", 0.8),
        ("university study", 0.8),
        ("data indicates", 0.7),
        ("statistics show", 0.7),
        ("expert opinion", 0.7),
        ("citation needed", 0.6),  # Shows awareness of need for sources
    ]
    
    text_lower = text.lower()
    score = 0.6  # Start with neutral score
    penalty_count = 0
    bonus_count = 0
    
    # Check for factual red flags
    for pattern, penalty in factual_red_flags:
        if pattern in text_lower:
            score *= penalty  # Heavily penalize factual errors
            penalty_count += 1
    
    # Check for suspicious patterns
    for pattern, penalty in suspicious_patterns:
        if pattern in text_lower:
            score *= (1 - penalty * 0.5)  # Moderate penalty
            penalty_count += 1
    
    # Check for quality indicators
    for pattern, bonus in quality_indicators:
        if pattern in text_lower:
            score = min(0.95, score + (1 - score) * 0.3)  # Boost score
            bonus_count += 1
    
    # Additional checks
    
    # Check for excessive capitalization (often indicates shouting/emotion)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.3:
        score *= 0.8
    
    # Check for excessive punctuation
    punct_ratio = sum(1 for c in text if c in "!!!???") / max(len(text), 1)
    if punct_ratio > 0.05:
        score *= 0.9
    
    # Very short statements are often oversimplified
    if len(text.split()) < 5:
        score *= 0.8
    
    # Ensure score stays in reasonable bounds
    score = max(0.05, min(0.95, score))
    
    return score


# Simple text analysis function
async def simple_text_analysis(text: str) -> Dict[str, Any]:
    """Advanced text analysis with factual accuracy detection"""
    try:
        # Basic analysis with TextBlob
        blob = TextBlob(text)
        sentiment = blob.sentiment
        
        # Map sentiment to trust score
        polarity = sentiment.polarity  # -1 to 1
        subjectivity = sentiment.subjectivity  # 0 to 1
        
        # Factual accuracy detection using known facts and patterns
        factual_score = detect_factual_issues(text.lower())
        
        # Calculate trust score with factual accuracy heavily weighted
        objectivity_score = 1 - subjectivity  # Higher is better
        neutrality_score = 1 - abs(polarity)  # Closer to 0 is more neutral
        
        # Weight factual accuracy much higher than sentiment
        trust_score = int((factual_score * 0.7 + objectivity_score * 0.2 + neutrality_score * 0.1) * 100)
        trust_score = max(5, min(95, trust_score))  # Keep in reasonable range
        
        # Determine verdict based on trust score
        if trust_score >= 80:
            verdict = "Highly Reliable"
        elif trust_score >= 60:
            verdict = "Generally Reliable"
        elif trust_score >= 40:
            verdict = "Moderately Reliable"
        else:
            verdict = "Questionable Reliability"
        
        # Sentiment mapping
        if sentiment.polarity > 0.3:
            sentiment_label = "Positive"
        elif sentiment.polarity < -0.3:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"
        
        return {
            "trustScore": trust_score,
            "verdict": verdict,
            "summary": f"Text analysis shows {sentiment_label.lower()} sentiment with {objectivity_score:.1%} objectivity",
            "sentiment": sentiment_label,
            "sources": [
                {
                    "web": {
                        "uri": "https://textblob.readthedocs.io",
                        "title": "TextBlob Sentiment Analysis"
                    }
                }
            ],
            "analysis_details": {
                "polarity": round(sentiment.polarity, 3),
                "subjectivity": round(sentiment.subjectivity, 3),
                "word_count": len(text.split()),
                "character_count": len(text)
            }
        }
    except Exception as e:
        # Fallback response
        return {
            "trustScore": 50,
            "verdict": "Analysis Incomplete",
            "summary": f"Basic analysis completed. Error in detailed analysis: {str(e)}",
            "sentiment": "Neutral",
            "sources": []
        }


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
        "cors_origins": "All origins allowed in development mode",
        "analysis_features": {
            "image_analysis": "OpenCV + PIL + EXIF extraction",
            "url_analysis": "Security headers + SSL + WHOIS",
            "text_analysis": "TextBlob sentiment analysis"
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
    """Analyze text using real sentiment analysis"""
    try:
        print(f"🔍 Analyzing text ({len(req.text)} characters)")
        result = await simple_text_analysis(req.text)
        print(f"✅ Text analysis completed with trust score: {result.get('trustScore', 'unknown')}")
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
    print("🚀 Starting CyberAI Inspector Backend with Real Analysis...")
    print("📊 Real Analysis Features:")
    print("   🖼️  Image Analysis: OpenCV, PIL, EXIF metadata extraction")
    print("   🌐 URL Analysis: Security headers, SSL certificates, WHOIS data")
    print("   📝 Text Analysis: TextBlob sentiment analysis, objectivity scoring")
    print("🌐 CORS enabled for all origins")
    print("🔗 Health check: http://localhost:8000/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )