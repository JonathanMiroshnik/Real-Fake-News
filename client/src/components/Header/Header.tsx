import { Link } from 'react-router';
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
  return (
    <header className="site-header">
      <h1 className="logo"><Link to="/">REAL FAKE NEWS</Link></h1>
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
