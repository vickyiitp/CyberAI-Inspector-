import React from 'react';
import type { FC, ReactNode } from 'react';

interface ResultSectionProps {
  title: string;
  children: ReactNode;
  onDownload?: () => void;
}

const DownloadIcon: FC = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const ResultSection: FC<ResultSectionProps> = ({ title, children, onDownload }) => {
  return (
    <div className="p-6 bg-gray-800/50 rounded-lg border border-cyan-500/20">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-2">
        <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
        {onDownload && (
            <button
                onClick={onDownload}
                className="flex items-center px-3 py-1 text-xs font-medium text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                aria-label="Download report"
            >
                <DownloadIcon />
                Download Report
            </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ResultSection;