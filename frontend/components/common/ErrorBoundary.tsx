import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 bg-red-900 text-white rounded-lg m-4">
          <h2 className="text-2xl font-bold mb-4">🚨 Something went wrong</h2>
          <details className="bg-red-800 p-4 rounded">
            <summary className="cursor-pointer font-semibold">Error Details</summary>
            <div className="mt-2">
              <p className="font-mono text-sm mb-2">
                <strong>Error:</strong> {this.state.error?.message}
              </p>
              {this.state.errorInfo && (
                <pre className="text-xs overflow-auto bg-red-700 p-2 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}