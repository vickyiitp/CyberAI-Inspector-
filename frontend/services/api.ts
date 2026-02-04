import type { ImageAnalysisResult, UrlAnalysisResult, TextAnalysisResult } from '../types';

// Dynamic API base URL that works with localhost, forwarded ports, and internet deployment
const getApiBaseUrl = (): string => {
  // Check for environment variable first (Vite uses VITE_ prefix)
  const envApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envApiUrl) {
    console.log('Using environment API URL:', envApiUrl);
    return envApiUrl;
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const currentOrigin = window.location.origin;
  
  console.log('Detecting API base URL for:', { protocol, hostname, port, currentOrigin });
  
  // If we're in development mode and running on localhost, use localhost:8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Local development detected');
    return 'http://localhost:8000';
  }
  
  // For internet deployment and forwarded ports
  let backendUrl: string;
  
  // Check if we're using common forwarding services
  if (hostname.includes('githubpreview.dev') || 
      hostname.includes('app.github.dev') || 
      hostname.includes('preview.app.github.dev')) {
    // GitHub Codespaces pattern: replace 3000 with 8000
    console.log('GitHub Codespaces detected');
    backendUrl = currentOrigin.replace('3000', '8000');
  } 
  else if (hostname.includes('localhost.run')) {
    // localhost.run pattern: backend usually on same domain with port 8000
    console.log('localhost.run detected');
    backendUrl = `${protocol}//${hostname}:8000`;
  }
  else if (hostname.includes('ngrok-free.app') || hostname.includes('ngrok.io') || hostname.includes('ngrok.app')) {
    // ngrok pattern: backend might be on different subdomain or same with port
    console.log('ngrok detected');
    if (port) {
      backendUrl = `${protocol}//${hostname}:8000`;
    } else {
      // Try to construct backend URL by replacing port number in hostname
      const backendHostname = hostname.replace('-3000', '-8000');
      backendUrl = `${protocol}//${backendHostname}`;
    }
  }
  else if (hostname.includes('tunnelto.dev') || 
           hostname.includes('trycloudflare.com') ||
           hostname.includes('loca.lt') ||
           hostname.includes('serveo.net')) {
    // Other tunnel services
    console.log('Tunnel service detected:', hostname);
    backendUrl = `${protocol}//${hostname}:8000`;
  }
  else if (port && port !== '80' && port !== '443') {
    // Generic port forwarding: replace frontend port with backend port
    console.log('Port forwarding detected, port:', port);
    if (port === '3000') {
      backendUrl = `${protocol}//${hostname}:8000`;
    } else {
      // Try to infer backend port
      backendUrl = `${protocol}//${hostname}:8000`;
    }
  }
  else {
    // For internet deployment/production (served from same domain)
    console.log('Production deployment detected');
    backendUrl = currentOrigin;
  }
  
  console.log('Constructed backend URL:', backendUrl);
  return backendUrl;
};

// Get initial API base URL
let API_BASE_URL = getApiBaseUrl();

// Function to test and fallback API URLs
const testApiConnection = async (url: string): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', url);
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      mode: 'cors',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    const isOk = response.ok;
    console.log('API connection test result:', isOk ? 'SUCCESS' : 'FAILED');
    return isOk;
  } catch (error) {
    console.log('API connection test failed:', error);
    return false;
  }
};

// Function to find working API URL with fallbacks
export const findWorkingApiUrl = async (): Promise<string> => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // List of possible backend URLs to try
  const possibleUrls = [
    API_BASE_URL, // Primary detected URL
    window.location.origin, // Try same origin (production/proxy)
    `${protocol}//${hostname}:8000`, // Same host with port 8000
    `http://${hostname}:8000`, // HTTP version
    `https://${hostname}:8000`, // HTTPS version
  ];
  
  // Add more fallbacks for specific services
  if (hostname.includes('ngrok')) {
    const backendHostname = hostname.replace('-3000', '-8000');
    possibleUrls.push(`${protocol}//${backendHostname}`);
  }
  
  // Remove duplicates
  const uniqueUrls = [...new Set(possibleUrls)];
  
  console.log('Trying API URLs in order:', uniqueUrls);
  
  // Test each URL
  for (const url of uniqueUrls) {
    if (await testApiConnection(url)) {
      console.log('Found working API URL:', url);
      API_BASE_URL = url; // Update the global variable
      return url;
    }
  }
  
  console.error('No working API URL found!');
  throw new Error(`Cannot connect to backend. Tried: ${uniqueUrls.join(', ')}`);
};

export const analyzeUrlWithBackend = async (url: string): Promise<UrlAnalysisResult> => {
  console.log(`Analyzing URL via backend: ${url}`);
  
  try {
    // First, find a working API URL
    const workingApiUrl = await findWorkingApiUrl();
    console.log(`Using backend API URL: ${workingApiUrl}`);
    
    const response = await fetch(`${workingApiUrl}/analyze-url/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
      throw new Error(errorData.detail || `Backend request failed: ${response.status}`);
    }

    const result: UrlAnalysisResult = await response.json();
    return result;
  } catch (error) {
    console.error('Backend connection error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend. Please ensure the backend server is running and accessible on port 8000.`);
    }
    throw error;
  }
};

export const analyzeImageWithBackend = async (file: File): Promise<ImageAnalysisResult> => {
    console.log(`Analyzing image via backend: ${file.name}`);

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Find a working API URL
        const workingApiUrl = await findWorkingApiUrl();
        console.log(`Using backend API URL: ${workingApiUrl}`);

        const response = await fetch(`${workingApiUrl}/analyze-image/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
            throw new Error(errorData.detail || `Backend request failed: ${response.status}`);
        }

        const result: ImageAnalysisResult = await response.json();
        return result;
    } catch (error) {
        console.error('Backend connection error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to backend. Please ensure the backend server is running and accessible on port 8000.`);
        }
        throw error;
    }
}

export const analyzeTextWithBackend = async (text: string): Promise<TextAnalysisResult> => {
    console.log(`Analyzing text via backend...`);

    try {
        // Find a working API URL
        const workingApiUrl = await findWorkingApiUrl();
        console.log(`Using backend API URL: ${workingApiUrl}`);

        const response = await fetch(`${workingApiUrl}/analyze-text/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
            throw new Error(errorData.detail || `Backend request failed: ${response.status}`);
        }

        const result: TextAnalysisResult = await response.json();
        return result;
    } catch (error) {
        console.error('Backend connection error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to backend. Please ensure the backend server is running and accessible on port 8000.`);
        }
        throw error;
    }
};
