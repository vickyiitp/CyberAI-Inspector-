import React from 'react';
import type { FC } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 max-w-2xl w-full p-8 space-y-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-bold text-cyan-400">About CyberAI-Inspector</h2>
        
        <p className="text-gray-300">
          CyberAI-Inspector is a proof-of-concept application developed to showcase the capabilities of generative AI in digital content analysis. As an academic project, its primary goal is to demonstrate how modern AI, specifically Google's Gemini models, can be leveraged to build tools that promote digital literacy and combat misinformation.
        </p>
        
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-cyan-300">Core Features:</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li><strong>Image Inspector:</strong> Analyzes images for potential signs of AI generation or manipulation.</li>
                <li><strong>URL Analyzer:</strong> Assesses the credibility of websites based on technical indicators.</li>
                <li><strong>Text Verifier:</strong> Fact-checks text using Google Search grounding to cite reliable sources.</li>
            </ul>
        </div>
        
        <p className="text-gray-300">
          This project utilizes a React-based frontend and a Python backend that interfaces with the Google Gemini API. It is intended for educational and demonstrative purposes only and should not be used as a sole tool for making critical security or credibility judgments.
        </p>

        <div className="text-xs text-gray-500 pt-4 border-t border-gray-700/50">
          Version 1.0.0 :: Academic Project
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
