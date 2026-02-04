import asyncio
import io
import base64
from typing import Dict, Any, List, Optional
import logging
import sys
import os

# Add parent directory to path to import azure_config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from azure.cognitiveservices.vision.computervision import ComputerVisionClient
    from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
    from azure.ai.contentsafety import ContentSafetyClient
    from azure.ai.contentsafety.models import AnalyzeTextOptions, AnalyzeImageOptions, TextCategory, ImageCategory
    from azure.ai.textanalytics import TextAnalyticsClient
    from azure.core.credentials import AzureKeyCredential
    from msrest.authentication import CognitiveServicesCredentials
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logging.warning("Azure SDK packages not installed. Install with: pip install azure-cognitiveservices-vision-computervision azure-ai-contentsafety azure-ai-textanalytics")

try:
    from azure_config import AzureConfig
except ImportError:
    # Fallback configuration if azure_config is not available
    class AzureConfig:
        COMPUTER_VISION_ENDPOINT = None
        COMPUTER_VISION_KEY = None
        CONTENT_SAFETY_ENDPOINT = None
        CONTENT_SAFETY_KEY = None
        TEXT_ANALYTICS_ENDPOINT = None
        TEXT_ANALYTICS_KEY = None
        
        @classmethod
        def is_computer_vision_configured(cls) -> bool:
            return False
        
        @classmethod
        def is_content_safety_configured(cls) -> bool:
            return False
        
        @classmethod
        def is_text_analytics_configured(cls) -> bool:
            return False

logger = logging.getLogger(__name__)


class AzureAIServices:
    """Azure AI Services integration for enhanced analysis"""
    
    def __init__(self):
        self.computer_vision_client = None
        self.content_safety_client = None
        self.text_analytics_client = None
        
        if AZURE_AVAILABLE:
            self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize Azure AI service clients"""
        try:
            # Computer Vision Client
            if AzureConfig.is_computer_vision_configured():
                credentials = CognitiveServicesCredentials(AzureConfig.COMPUTER_VISION_KEY)
                self.computer_vision_client = ComputerVisionClient(
                    AzureConfig.COMPUTER_VISION_ENDPOINT, credentials
                )
                logger.info("Azure Computer Vision client initialized")
            
            # Content Safety Client
            if AzureConfig.is_content_safety_configured():
                self.content_safety_client = ContentSafetyClient(
                    AzureConfig.CONTENT_SAFETY_ENDPOINT,
                    AzureKeyCredential(AzureConfig.CONTENT_SAFETY_KEY)
                )
                logger.info("Azure Content Safety client initialized")
            
            # Text Analytics Client
            if AzureConfig.is_text_analytics_configured():
                self.text_analytics_client = TextAnalyticsClient(
                    AzureConfig.TEXT_ANALYTICS_ENDPOINT,
                    AzureKeyCredential(AzureConfig.TEXT_ANALYTICS_KEY)
                )
                logger.info("Azure Text Analytics client initialized")
                
        except Exception as e:
            logger.error(f"Failed to initialize Azure clients: {e}")
    
    async def analyze_image_with_azure(self, image_data: bytes) -> Dict[str, Any]:
        """Enhanced image analysis using Azure Computer Vision"""
        if not self.computer_vision_client:
            return {"azure_analysis": "Azure Computer Vision not configured"}
        
        try:
            # Convert bytes to stream
            image_stream = io.BytesIO(image_data)
            
            # Analyze image with Computer Vision
            features = [
                "adult",  # Adult/racy content detection
                "brands", # Brand detection
                "categories", # Image categorization
                "description", # Image description
                "faces", # Face detection
                "objects", # Object detection
                "tags"  # Image tags
            ]
            
            analysis = self.computer_vision_client.analyze_image_in_stream(
                image_stream, visual_features=features
            )
            
            azure_results = {
                "azure_analysis": "success",
                "description": analysis.description.captions[0].text if analysis.description.captions else "No description",
                "confidence": analysis.description.captions[0].confidence if analysis.description.captions else 0,
                "tags": [{"name": tag.name, "confidence": tag.confidence} for tag in analysis.tags] if analysis.tags else [],
                "categories": [{"name": cat.name, "score": cat.score} for cat in analysis.categories] if analysis.categories else [],
                "adult_content": {
                    "is_adult": analysis.adult.is_adult_content,
                    "adult_score": analysis.adult.adult_score,
                    "is_racy": analysis.adult.is_racy_content,
                    "racy_score": analysis.adult.racy_score
                } if analysis.adult else {},
                "faces": len(analysis.faces) if analysis.faces else 0,
                "objects": [{"name": obj.object_property, "confidence": obj.confidence} for obj in analysis.objects] if analysis.objects else [],
                "brands": [{"name": brand.name, "confidence": brand.confidence} for brand in analysis.brands] if analysis.brands else []
            }
            
            return azure_results
            
        except Exception as e:
            logger.error(f"Azure Computer Vision analysis failed: {e}")
            return {"azure_analysis": f"Error: {str(e)}"}
    
    async def check_content_safety_image(self, image_data: bytes) -> Dict[str, Any]:
        """Check image for harmful content using Azure Content Safety"""
        if not self.content_safety_client:
            return {"content_safety": "Azure Content Safety not configured"}
        
        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            
            # Analyze image safety
            request = AnalyzeImageOptions(image={"content": image_b64})
            response = self.content_safety_client.analyze_image(request)
            
            safety_results = {
                "content_safety": "success",
                "categories": {}
            }
            
            # Process safety categories
            for category_result in response.categories_analysis:
                category_name = category_result.category.value if hasattr(category_result.category, 'value') else str(category_result.category)
                safety_results["categories"][category_name] = {
                    "severity": category_result.severity,
                    "rejected": category_result.severity >= 4  # High severity threshold
                }
            
            return safety_results
            
        except Exception as e:
            logger.error(f"Azure Content Safety analysis failed: {e}")
            return {"content_safety": f"Error: {str(e)}"}
    
    async def analyze_text_with_azure(self, text: str) -> Dict[str, Any]:
        """Enhanced text analysis using Azure Text Analytics"""
        if not self.text_analytics_client:
            return {"azure_text_analysis": "Azure Text Analytics not configured"}
        
        try:
            documents = [text]
            
            # Sentiment Analysis
            sentiment_response = self.text_analytics_client.analyze_sentiment(documents)
            sentiment_result = sentiment_response[0] if sentiment_response else None
            
            # Key Phrase Extraction
            key_phrases_response = self.text_analytics_client.extract_key_phrases(documents)
            key_phrases_result = key_phrases_response[0] if key_phrases_response else None
            
            # Entity Recognition
            entities_response = self.text_analytics_client.recognize_entities(documents)
            entities_result = entities_response[0] if entities_response else None
            
            azure_results = {
                "azure_text_analysis": "success",
                "sentiment": {
                    "sentiment": sentiment_result.sentiment if sentiment_result else "unknown",
                    "confidence_scores": {
                        "positive": sentiment_result.confidence_scores.positive if sentiment_result else 0,
                        "neutral": sentiment_result.confidence_scores.neutral if sentiment_result else 0,
                        "negative": sentiment_result.confidence_scores.negative if sentiment_result else 0
                    } if sentiment_result else {}
                },
                "key_phrases": key_phrases_result.key_phrases if key_phrases_result else [],
                "entities": [
                    {
                        "text": entity.text,
                        "category": entity.category,
                        "confidence_score": entity.confidence_score
                    } for entity in entities_result.entities
                ] if entities_result else []
            }
            
            return azure_results
            
        except Exception as e:
            logger.error(f"Azure Text Analytics failed: {e}")
            return {"azure_text_analysis": f"Error: {str(e)}"}
    
    async def check_content_safety_text(self, text: str) -> Dict[str, Any]:
        """Check text for harmful content using Azure Content Safety"""
        if not self.content_safety_client:
            return {"content_safety": "Azure Content Safety not configured"}
        
        try:
            # Analyze text safety
            request = AnalyzeTextOptions(text=text)
            response = self.content_safety_client.analyze_text(request)
            
            safety_results = {
                "content_safety": "success",
                "categories": {}
            }
            
            # Process safety categories
            for category_result in response.categories_analysis:
                category_name = category_result.category.value if hasattr(category_result.category, 'value') else str(category_result.category)
                safety_results["categories"][category_name] = {
                    "severity": category_result.severity,
                    "rejected": category_result.severity >= 4  # High severity threshold
                }
            
            return safety_results
            
        except Exception as e:
            logger.error(f"Azure Content Safety text analysis failed: {e}")
            return {"content_safety": f"Error: {str(e)}"}

# Global instance
azure_ai = AzureAIServices()