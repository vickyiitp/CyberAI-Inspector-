import React from 'react';
import type { FC, SVGProps, Dispatch, SetStateAction } from 'react';
import type { ActiveModule } from '../types';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: Dispatch<SetStateAction<ActiveModule>>;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

interface NavItemProps {
  icon: FC<SVGProps<SVGSVGElement>>;
  label: string;
  moduleName: ActiveModule;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: FC<NavItemProps> = ({ icon: Icon, label, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    aria-label={label}
    className={`flex items-center w-full py-3 transition-all duration-200 rounded-md ${
      isCollapsed ? 'px-3 justify-center' : 'px-4 space-x-3'
    } ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    <Icon className="w-6 h-6 flex-shrink-0" />
    {!isCollapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

const ImageIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UrlIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const TextIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CollapseIcon: FC<{ isCollapsed: boolean } & SVGProps<SVGSVGElement>> = ({ isCollapsed, ...props }) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        )}
    </svg>
);


const Sidebar: FC<SidebarProps> = ({ activeModule, setActiveModule, isCollapsed, setIsCollapsed }) => {
  return (
    <aside className={`relative flex flex-col p-2 bg-gray-800/50 border-r border-cyan-500/20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <nav className="flex-1 space-y-2">
        <NavItem 
          icon={ImageIcon} 
          label="Image Inspector" 
          moduleName="image" 
          isActive={activeModule === 'image'} 
          onClick={() => setActiveModule('image')} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          icon={UrlIcon} 
          label="URL Analyzer" 
          moduleName="url" 
          isActive={activeModule === 'url'} 
          onClick={() => setActiveModule('url')} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          icon={TextIcon} 
          label="Text Verifier" 
          moduleName="text" 
          isActive={activeModule === 'text'} 
          onClick={() => setActiveModule('text')} 
          isCollapsed={isCollapsed}
        />
      </nav>
      <div className="mt-4 pt-2 border-t border-gray-700/50">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 text-gray-400 rounded-md hover:bg-gray-700/50 hover:text-white transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
               <CollapseIcon isCollapsed={isCollapsed} className="w-6 h-6" />
           </button>
      </div>
    </aside>
  );
};

export default Sidebar;