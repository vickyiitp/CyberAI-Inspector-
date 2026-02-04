import React, { useState } from 'react';
import { testBackendConnection } from '../services/api_simple';

interface DebugAnalyzerProps {
  title: string;
}

const DebugAnalyzer: React.FC<DebugAnalyzerProps> = ({ title }) => {
  const [status, setStatus] = useState<string>('Ready');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Get API base URL (similar to api_simple.ts logic)
  const getApiBaseUrl = (): string => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    
    return `${protocol}//${hostname}:8000`;
  };

  const handleDebugTest = async () => {
    try {
      console.log('🐛 Debug: Starting test...');
      setStatus('Testing connection...');
      setError('');
      setResult(null);

      // Test 1: Backend connection
      console.log('🐛 Debug: Testing backend connection...');
      const connectionTest = await testBackendConnection();
      console.log('🐛 Debug: Connection test result:', connectionTest);
      
      if (!connectionTest) {
        throw new Error('Connection test failed');
      }

      setStatus('Connection successful, sending test request...');

      // Test 2: Simple API call
      const apiUrl = getApiBaseUrl();
      console.log('🐛 Debug: Making test API call to:', apiUrl);
      const response = await fetch(`${apiUrl}/health`);
      console.log('🐛 Debug: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🐛 Debug: Response data:', data);

      setResult(data);
      setStatus('Test completed successfully!');
      
    } catch (err: any) {
      console.error('🐛 Debug: Error occurred:', err);
      setError(err.message || 'Unknown error');
      setStatus('Test failed');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🐛 Debug Component - {title}</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> <span style={{ color: error ? 'red' : 'green' }}>{status}</span>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          backgroundColor: '#e6ffe6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>Result:</strong>
          <pre style={{ margin: '5px 0', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <button 
        onClick={handleDebugTest}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔍 Run Debug Test
      </button>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#666',
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '4px'
      }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Run Debug Test" button</li>
          <li>Watch console for detailed debug messages</li>
          <li>Check for any red error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugAnalyzer;