import { Link, NavLink } from 'react-router';
import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import './Header.css'

// TODO: fix how I import public images like logo into website
/**  🛠️ Alternative: Importing Images (Recommended for non-public assets)
If the image is in src/assets/logo.png:
import logo from '../assets/logo.png';
<img src={logo} alt="Logo" />
This has the advantage of being processed by Vite's bundler — it handles caching, hashing, and optimizing for you. */


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
  const darkMode: boolean = useContext(DarkModeContext).dark;

  return (
    <header className="site-header">
      <h1 className="logo">
        <Link to="/">
          <img src={darkMode ? "/alternativeLogoBlack.png" : "/alternativeSiteLogo.png"} className="logo-img" alt="Logo" />
        </Link>
      </h1>
      <nav className="header-navbar-list">
        {sections.map((section) => (
          // <Link key={"header_link_" + section} to={`/category/${section.toLowerCase()}`}>
          //  {/* <button className='nav-button' >
          //     {section}
          //  </button> */}
          //  <div className="nav-a-link-wrapper">
          //   <a className="nav-a-link">{section}</a>
          //  </div>           
          // </Link>
          <NavLink 
              key={"header_link_" + section}
              to={`/category/${section.toLowerCase()}`}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {/* <button className='nav-button' >
                {section}
              </button> */}
              <div className="nav-a-link-wrapper nav-a-link">
                {section}
              </div>  
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;
