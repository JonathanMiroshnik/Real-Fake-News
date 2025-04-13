import React from 'react';

import './Footer.module.css'

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>© 2025 Real Fake News - Satirical AI-generated content</p>
        <div className="legal-links">
          <a href="/disclaimer">Disclaimer</a>
          <a href="/terms">Terms of Use</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};
