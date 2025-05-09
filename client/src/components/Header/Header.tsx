import { Link } from 'react-router';
import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import './Header.css'

interface HeaderProps {
  /** Array of category names for navigation */
  sections: string[];
}

/**
 * Site header with logo and category navigation
 * - Uses responsive button layout
 * - Generates category routes dynamically
 * - Applies consistent styling across viewports
 */
function Header({ sections }: HeaderProps) {
  const darkMode: boolean = useContext(DarkModeContext).dark

  return (
    <header className="site-header">
      <h1 className="logo"><Link to="/"><img src={darkMode ? "alternativeLogoBlack.png" : "alternativeSiteLogo.png"} className="logo-img" /></Link></h1>
      <nav>
        {sections.map((section) => (
          <Link key={"header_link_" + section} to={`/category/${section.toLowerCase()}`}>
           <button className='nav-button' >
              {section}
           </button>
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
