import React from 'react';

import './Header.module.css'

interface HeaderProps {
  sections: string[];
}

function Header({ sections }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="logo">REAL FAKE NEWS</div>
      <nav>
        {sections.map((section) => (
          <button key={section} className="nav-button">
            {section}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;