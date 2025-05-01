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
          <Link to={`/category/${section.toLowerCase()}`}>
           <button key={"header_button_" + section} className='nav-button' >
              {section}
            </button>
            </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;