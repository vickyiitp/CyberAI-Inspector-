import type { ImageAnalysisResult, UrlAnalysisResult, TextAnalysisResult } from '../types';

// Simple, reliable API base URL detection
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envApiUrl) {
    console.log('Using environment API URL:', envApiUrl);
    return envApiUrl;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('Current location:', window.location.href);
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Local development detected');
    return 'http://localhost:8000';
  }
  
  // For forwarded ports - simple approach
  console.log('Forwarded port detected, using same host with port 8000');
  return `${protocol}//${hostname}:8000`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL set to:', API_BASE_URL);

export const analyzeUrlWithBackend = async (url: string): Promise<UrlAnalysisResult> => {
  console.log(`Analyzing URL via backend: ${url}`);
  console.log(`Using backend URL: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-url/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: UrlAnalysisResult = await response.json();
    console.log('Analysis result:', result);
    return result;
  } catch (error) {
    console.error('Backend connection error:', error);
    throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const analyzeImageWithBackend = async (file: File): Promise<ImageAnalysisResult> => {
    console.log(`Analyzing image via backend: ${file.name}`);
    console.log(`Using backend URL: ${API_BASE_URL}`);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze-image/`, {
            method: 'POST',
            body: formData,
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ImageAnalysisResult = await response.json();
        console.log('Analysis result:', result);
        return result;
    } catch (error) {
        console.error('Backend connection error:', error);
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const analyzeTextWithBackend = async (text: string): Promise<TextAnalysisResult> => {
    console.log(`Analyzing text via backend...`);
    console.log(`Using backend URL: ${API_BASE_URL}`);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze-text/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: TextAnalysisResult = await response.json();
        console.log('Analysis result:', result);
        return result;
    } catch (error) {
        console.error('Backend connection error:', error);
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Health check function for troubleshooting
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
    });
    
    const isOk = response.ok;
    console.log('Backend connection test:', isOk ? 'SUCCESS' : 'FAILED');
    
    if (isOk) {
      const data = await response.json();
      console.log('Backend response:', data);
    }
    
    return isOk;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};