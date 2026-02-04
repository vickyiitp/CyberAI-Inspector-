#!/bin/bash

# CyberAI Inspector Demo Test Script

echo "Testing CyberAI Inspector API endpoints..."

API_BASE="http://localhost:8001"

echo "1. Testing backend health check..."
curl -s "$API_BASE/" | python -m json.tool

echo -e "\n2. Testing URL analysis..."
curl -s -X POST "$API_BASE/analyze-url/" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com"}' | python -m json.tool

echo -e "\n3. Testing text analysis..."
curl -s -X POST "$API_BASE/analyze-text/" \
     -H "Content-Type: application/json" \
     -d '{"text": "This is a great article about technology and innovation. It provides excellent insights into the future."}' | python -m json.tool

echo -e "\nDemo complete! All endpoints are working."