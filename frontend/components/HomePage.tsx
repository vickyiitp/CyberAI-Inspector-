import React from 'react';
import type { FC, Dispatch, SetStateAction, SVGProps } from 'react';
import type { ActiveModule } from '../types';

interface HomePageProps {
  setActiveModule: Dispatch<SetStateAction<ActiveModule>>;
}

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

const FeatureCard: FC<{
  icon: FC<SVGProps<SVGSVGElement>>,
  title: string,
  description: string,
  onClick: () => void,
}> = ({ icon: Icon, title, description, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 text-left transition-all duration-300 hover:bg-gray-800 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
  >
    <Icon className="w-10 h-10 mb-4 text-cyan-400" />
    <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </button>
);


const HomePage: FC<HomePageProps> = ({ setActiveModule }) => {
  return (
    <div className="animate-fadeIn space-y-12">
      <div className="text-center p-8 bg-gray-800/30 rounded-lg border border-gray-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-300 tracking-wide">
          Digital Clarity in a Complex World
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-400">
          CyberAI-Inspector is an advanced suite of tools designed to bring transparency to the digital content you consume. Analyze images, URLs, and text to uncover manipulation, assess credibility, and verify information with the power of AI.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          icon={ImageIcon}
          title="Image Inspector"
          description="Upload an image to detect signs of AI generation or deepfake manipulation. Our tool performs a forensic analysis of metadata, compression, and visual artifacts."
          onClick={() => setActiveModule('image')}
        />
        <FeatureCard 
          icon={UrlIcon}
          title="URL Analyzer"
          description="Investigate a website's credibility. We analyze domain age, SSL certificates, and other technical markers to flag potentially untrustworthy or malicious sites."
          onClick={() => setActiveModule('url')}
        />
        <FeatureCard 
          icon={TextIcon}
          title="Text Verifier"
          description="Fact-check articles, posts, or any text. Our AI cross-references claims against trusted web sources to provide a verified summary and source list."
          onClick={() => setActiveModule('text')}
        />
      </div>
    </div>
  );
};

export default HomePage;
