# Azure AI Configuration Example
# Copy this to azure_config.py and fill in your Azure credentials

"""
STEP 1: Get Azure Credentials
1. Go to https://portal.azure.com
2. Create these services in Cognitive Services:
   - Computer Vision
   - Content Safety  
   - Text Analytics (Language)
3. Get Endpoint URL and API Key for each service
"""

import os
from typing import Optional

class AzureConfig:
    # 🔧 REPLACE THESE WITH YOUR AZURE CREDENTIALS 🔧
    
    # Computer Vision (for image analysis)
    COMPUTER_VISION_ENDPOINT = "https://your-computer-vision.cognitiveservices.azure.com/"
    COMPUTER_VISION_KEY = "your-computer-vision-api-key-here"
    
    # Content Safety (for harmful content detection)
    CONTENT_SAFETY_ENDPOINT = "https://your-content-safety.cognitiveservices.azure.com/"
    CONTENT_SAFETY_KEY = "your-content-safety-api-key-here"
    
    # Text Analytics (for text analysis)
    TEXT_ANALYTICS_ENDPOINT = "https://your-text-analytics.cognitiveservices.azure.com/"
    TEXT_ANALYTICS_KEY = "your-text-analytics-api-key-here"
    
    @classmethod
    def is_computer_vision_configured(cls) -> bool:
        return bool(cls.COMPUTER_VISION_ENDPOINT and cls.COMPUTER_VISION_KEY and 
                   "your-" not in cls.COMPUTER_VISION_ENDPOINT)
    
    @classmethod
    def is_content_safety_configured(cls) -> bool:
        return bool(cls.CONTENT_SAFETY_ENDPOINT and cls.CONTENT_SAFETY_KEY and 
                   "your-" not in cls.CONTENT_SAFETY_ENDPOINT)
    
    @classmethod
    def is_text_analytics_configured(cls) -> bool:
        return bool(cls.TEXT_ANALYTICS_ENDPOINT and cls.TEXT_ANALYTICS_KEY and 
                   "your-" not in cls.TEXT_ANALYTICS_ENDPOINT)

# 🚀 Quick Test - Uncomment to test with your real credentials:
# AzureConfig.COMPUTER_VISION_ENDPOINT = "https://your-actual-endpoint.cognitiveservices.azure.com/"
# AzureConfig.COMPUTER_VISION_KEY = "your-actual-api-key"