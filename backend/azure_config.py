"""
Azure AI Services Configuration
You need to set these environment variables or update them directly:

1. AZURE_COMPUTER_VISION_ENDPOINT - Your Azure Computer Vision endpoint
2. AZURE_COMPUTER_VISION_KEY - Your Azure Computer Vision API key
3. AZURE_CONTENT_SAFETY_ENDPOINT - Your Azure Content Safety endpoint  
4. AZURE_CONTENT_SAFETY_KEY - Your Azure Content Safety API key
5. AZURE_TEXT_ANALYTICS_ENDPOINT - Your Azure Text Analytics endpoint
6. AZURE_TEXT_ANALYTICS_KEY - Your Azure Text Analytics API key

Get these from your Azure Portal > Cognitive Services
"""

import os
from typing import Optional

class AzureConfig:
    # Computer Vision (for image analysis, OCR, object detection)
    COMPUTER_VISION_ENDPOINT: Optional[str] = os.getenv("AZURE_COMPUTER_VISION_ENDPOINT")
    COMPUTER_VISION_KEY: Optional[str] = os.getenv("AZURE_COMPUTER_VISION_KEY")
    
    # Content Safety (for harmful content detection)
    CONTENT_SAFETY_ENDPOINT: Optional[str] = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")
    CONTENT_SAFETY_KEY: Optional[str] = os.getenv("AZURE_CONTENT_SAFETY_KEY")
    
    # Text Analytics (for sentiment, entities, key phrases)
    TEXT_ANALYTICS_ENDPOINT: Optional[str] = os.getenv("AZURE_TEXT_ANALYTICS_ENDPOINT") 
    TEXT_ANALYTICS_KEY: Optional[str] = os.getenv("AZURE_TEXT_ANALYTICS_KEY")
    
    @classmethod
    def is_computer_vision_configured(cls) -> bool:
        return bool(cls.COMPUTER_VISION_ENDPOINT and cls.COMPUTER_VISION_KEY)
    
    @classmethod
    def is_content_safety_configured(cls) -> bool:
        return bool(cls.CONTENT_SAFETY_ENDPOINT and cls.CONTENT_SAFETY_KEY)
    
    @classmethod
    def is_text_analytics_configured(cls) -> bool:
        return bool(cls.TEXT_ANALYTICS_ENDPOINT and cls.TEXT_ANALYTICS_KEY)

# Alternative: Set your credentials directly here (not recommended for production)
# Uncomment and fill in your Azure credentials:

# AzureConfig.COMPUTER_VISION_ENDPOINT = "https://your-resource.cognitiveservices.azure.com/"
# AzureConfig.COMPUTER_VISION_KEY = "your-computer-vision-key"

# AzureConfig.CONTENT_SAFETY_ENDPOINT = "https://your-content-safety.cognitiveservices.azure.com/"
# AzureConfig.CONTENT_SAFETY_KEY = "your-content-safety-key"

# AzureConfig.TEXT_ANALYTICS_ENDPOINT = "https://your-text-analytics.cognitiveservices.azure.com/"
# AzureConfig.TEXT_ANALYTICS_KEY = "your-text-analytics-key"