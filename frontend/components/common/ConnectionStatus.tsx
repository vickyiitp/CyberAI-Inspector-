import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Import the simple API service function
      const { testBackendConnection } = await import('../../services/api_simple');
      const isConnected = await testBackendConnection();
      setIsConnected(isConnected);
      
      if (isConnected) {
        // Get the API URL from simple service
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const url = (hostname === 'localhost' || hostname === '127.0.0.1') 
          ? 'http://localhost:8000' 
          : `${protocol}//${hostname}:8000`;
        setBackendUrl(url);
      } else {
        setBackendUrl('Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      setBackendUrl('Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-400 ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
        <span>Testing backend connection...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
      <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
        Backend: {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      <span className="text-gray-500 text-xs">({backendUrl})</span>
      <button 
        onClick={testConnection}
        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
      >
        Retry
      </button>
    </div>
  );
};

export default ConnectionStatus;