import React from 'react';
import type { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="text-center p-3 text-xs text-gray-600 border-t border-cyan-500/20 bg-gray-900">
      © {new Date().getFullYear()} CyberAI-Inspector. A demonstration project for advanced AI applications.
    </footer>
  );
};

export default Footer;
