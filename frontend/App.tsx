import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ImageAnalyzer from './components/ImageAnalyzer';
import UrlAnalyzer from './components/UrlAnalyzer';
import TextAnalyzer from './components/TextAnalyzer';
import AboutModal from './components/common/AboutModal';
import DebugAnalyzer from './components/DebugAnalyzer';
import type { ActiveModule } from './types';

const App: FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Global error handler to catch unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global Error:', event.error);
      console.error('🚨 Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Add debug mode toggle with key combination
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press Ctrl+Shift+D to toggle debug mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsDebugMode(prev => !prev);
        console.log('Debug mode toggled:', !isDebugMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDebugMode]);

  useEffect(() => {
    const handleResize = () => {
      // Automatically collapse the sidebar on small screens, but don't automatically expand it
      // to respect the user's choice on larger screens.
      if (window.innerWidth < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Call handler on mount to set initial state
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);


  const renderActiveModule = () => {
    console.log('🔄 Rendering module:', activeModule);
    
    try {
      switch (activeModule) {
        case 'home':
          console.log('✅ Rendering HomePage');
          return <HomePage setActiveModule={setActiveModule} />;
        case 'image':
          console.log('✅ Rendering ImageAnalyzer');
          return <ImageAnalyzer />;
        case 'url':
          console.log('✅ Rendering UrlAnalyzer');
          return <UrlAnalyzer />;
        case 'text':
          console.log('✅ Rendering TextAnalyzer');
          return <TextAnalyzer />;
        default:
          console.log('✅ Rendering default HomePage');
          return <HomePage setActiveModule={setActiveModule} />;
      }
    } catch (error) {
      console.error('❌ Error rendering module:', error);
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl text-red-400 mb-4">Rendering Error</h2>
          <p className="text-gray-300">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button 
            onClick={() => setActiveModule('home')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Return to Home
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen font-mono bg-gray-900 text-gray-200">
      {/* Debug indicator */}
      {isDebugMode && (
        <div className="bg-yellow-600 text-black px-4 py-2 text-sm">
          🐛 DEBUG MODE - Press Ctrl+Shift+D to toggle | Current module: {activeModule}
        </div>
      )}
      
      <Header 
        setActiveModule={setActiveModule} 
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Debug panel when enabled */}
          {isDebugMode && (
            <div className="mb-6">
              <DebugAnalyzer title="Connection Test" />
            </div>
          )}
          
          {renderActiveModule()}
        </main>
      </div>
      <Footer />
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </div>
  );
};

export default App;