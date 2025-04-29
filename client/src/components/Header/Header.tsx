import React from 'react';
import { Link } from 'react-router';

import './Header.css'

interface HeaderProps {
  sections: string[];
}

function Header({ sections }: HeaderProps) {
  return (
    <header className="site-header">
      {/* style={{margin:"80px"}} */}
      <h1 className="logo"><Link to="/">REAL FAKE NEWS</Link></h1>
      <nav>
        {sections.map((section) => (
           <button key={"header_button_" + section} className='nav-button' >
              <Link to={`/${section.toLowerCase()}`}>{section}</Link>
            </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;