
import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 px-4 text-center text-discord-light">
      <p className="flex items-center justify-center gap-1">
        Built by 
        <a 
          href="https://github.com/415gianca" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-discord-primary hover:text-white transition-colors"
        >
          415Gianca⚡ 
          <ExternalLink size={14} />
        </a>
      </p>
    </footer>
  );
};

export default Footer;
