# CyberAI Inspector

<div align="center">
<img width="1200" height="475" alt="CyberAI Inspector Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A comprehensive AI-powered analysis suite for detecting manipulation, verifying authenticity, and assessing trustworthiness of digital content including images, URLs, and text.

## Features

### 🖼️ Image Inspector
- **AI Generation Detection**: Analyzes images for signs of AI generation or deepfake manipulation
- **Metadata Analysis**: Extracts and examines EXIF data and file properties
- **Compression Analysis**: Detects recompression artifacts and quality degradation
- **Forensic Artifacts**: Identifies visual artifacts that indicate manipulation

### 🌐 URL Analyzer
- **Domain Analysis**: Checks domain age, registrar information, and reputation
- **Security Assessment**: Evaluates SSL certificates and HTTPS implementation
- **Phishing Detection**: Identifies suspicious patterns and potential phishing attempts
- **Backlink Profile**: Analyzes link reputation and authority

### 📝 Text Verifier
- **Content Analysis**: Fact-checks articles and posts against trusted sources
- **Sentiment Analysis**: Determines emotional tone and bias
- **Misinformation Detection**: Identifies common misinformation patterns and clickbait
- **Source Verification**: Cross-references claims with authoritative sources

## Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)

### Option 1: Automated Startup (Windows)

1. **Start Backend**: Run `scripts\start-backend.bat`
2. **Start Frontend**: Run `scripts\start-frontend.bat`
3. **Access App**: Open http://localhost:5173 in your browser

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will be available at: http://localhost:8000

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5173

### Option 3: Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Backend (Python/FastAPI)
- **FastAPI Framework**: High-performance async API server
- **Modular Analyzers**: Separate modules for image, URL, and text analysis
- **CORS Enabled**: Allows frontend communication
- **Type Safety**: Full type hints and validation

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── azure_config.py      # Azure AI services configuration
└── analyzers/
    ├── __init__.py
    ├── models.py        # Response data models
    ├── azure_ai.py      # Azure AI services integration
    ├── image_analyzer.py # Image analysis logic
    ├── url_analyzer.py   # URL analysis logic
    └── text_analyzer.py  # Text analysis logic
```

### Frontend (React/TypeScript)
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with dark theme
- **Vite**: Fast build tool and development server

```
frontend/
├── index.html
├── index.tsx           # Application entry point
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── services/
│   ├── api.ts          # Backend API integration
│   ├── geminiService.ts # AI service integration
│   └── pdfGenerator.ts  # Report generation
└── components/
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── Footer.tsx
    ├── HomePage.tsx
    ├── ImageAnalyzer.tsx
    ├── UrlAnalyzer.tsx
    ├── TextAnalyzer.tsx
    └── common/
        ├── AboutModal.tsx
        ├── ResultSection.tsx
        ├── Spinner.tsx
        └── TrustScoreGauge.tsx
```

## API Endpoints

### Backend API (http://localhost:8000)

- `GET /` - API health check
- `POST /analyze-url/` - Analyze URL trustworthiness
- `POST /analyze-text/` - Analyze text content
- `POST /analyze-image/` - Analyze image authenticity

#### Example URL Analysis Request:
```bash
curl -X POST "http://localhost:8000/analyze-url/" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
```

#### Example Response:
```json
{
  "trustScore": 75,
  "verdict": "Trustworthy",
  "domainInfo": [
    {"name": "Domain", "value": "example.com"},
    {"name": "Protocol", "value": "HTTPS"}
  ],
  "sslInfo": [
    {"name": "HTTPS", "value": "Yes"},
    {"name": "Certificate", "value": "Valid"}
  ],
  "backlinkProfile": {
    "total": 150,
    "reputable": 112
  }
}
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
- **Python**: Uses type hints and follows PEP 8
- **TypeScript**: Strict mode enabled with full type safety
- **Linting**: ESLint for JavaScript/TypeScript

### Adding New Analyzers

1. Create new analyzer in `backend/analyzers/`
2. Add corresponding endpoint in `backend/main.py`
3. Update frontend types in `frontend/types.ts`
4. Create new component in `frontend/components/`

## Configuration

### Environment Variables
Create a `.env.local` file in the root directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend Configuration
- **Host**: Default 0.0.0.0 (all interfaces)
- **Port**: Default 8000
- **CORS**: Configured for localhost development

### Frontend Configuration
- **API Base URL**: http://localhost:8000
- **Development Port**: 5173
- **Build Output**: `frontend/dist/`

## Security Features

- **Input Validation**: All inputs are validated and sanitized
- **File Type Checking**: Images are validated by content headers
- **URL Parsing**: Safe URL parsing and validation
- **CORS Protection**: Configured for development and production
- **Error Handling**: Comprehensive error handling and user feedback

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port in `backend/main.py`
- **Python dependencies**: Run `pip install -r requirements.txt`
- **Import errors**: Ensure Python 3.8+ is installed

### Frontend Issues
- **Port 5173 in use**: Vite will automatically use next available port
- **Node dependencies**: Run `npm install` or `npm ci`
- **Build errors**: Ensure Node.js 16+ is installed

### CORS Issues
- Ensure backend is running on port 8000
- Check API_BASE_URL in `frontend/services/api.ts`
- Verify CORS configuration in `backend/main.py`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **FastAPI**: Modern Python web framework
- **React**: Frontend library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next generation frontend tooling
