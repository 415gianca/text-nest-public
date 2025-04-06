
import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 text-center text-discord-light text-sm">
      <div className="flex items-center justify-center space-x-1">
        <span>Built by</span>
        <a 
          href="https://github.com/415gianca" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-discord-primary hover:text-discord-primary/80 flex items-center"
        >
          415Gianca⚡
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
      <div className="mt-1 text-xs">
        💬 Text Nest 🐣 - A simple messaging platform
      </div>
    </footer>
  );
};

export default Footer;
