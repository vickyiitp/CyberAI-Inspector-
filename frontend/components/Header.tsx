import React from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
import type { ActiveModule } from '../types';
import ConnectionStatus from './common/ConnectionStatus';

interface HeaderProps {
  setActiveModule: Dispatch<SetStateAction<ActiveModule>>;
  onOpenAbout: () => void;
}

const Header: FC<HeaderProps> = ({ setActiveModule, onOpenAbout }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-cyan-500/20 backdrop-blur-sm z-10">
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => setActiveModule('home')}
          className="flex items-center space-x-3 transition-opacity duration-200 hover:opacity-80"
          aria-label="Go to homepage"
        >
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-wider text-cyan-400">
            CyberAI-Inspector
          </h1>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <ConnectionStatus className="hidden md:block" />
        <button 
          onClick={onOpenAbout}
          className="px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
        >
          About
        </button>
        <div className="text-xs text-gray-500 hidden sm:block">v1.0.0 :: Academic Project</div>
      </div>
    </header>
  );
};

export default Header;