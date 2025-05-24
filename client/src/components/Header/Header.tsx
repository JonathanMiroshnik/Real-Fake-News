import { Link, NavLink } from 'react-router';
import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import './Header.css'

// import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

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
  






  // async function handleLoginSuccess(credentialResponse: CredentialResponse) {
  //   // TODO: make this into global constant
  //   // Differentiates between development and production mode URLs
  //   let VITE_API_BASE: string = "";
  //   if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
  //     VITE_API_BASE = "http://localhost:5000";
  //   }
  //   else {
  //     VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
  //                   "http://localhost:5000" : 
  //                   "https://real.sensorcensor.xyz";
  //   }

  //   if (!credentialResponse.credential) {
  //     console.error("Missing credential in response");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${VITE_API_BASE}/api/auth/google`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ token: credentialResponse.credential }),
  //     });

  //     if (!res.ok) {
  //       throw new Error(`Backend responded with status ${res.status}`);
  //     }

  //     const data = await res.json();
  //     console.log("User verified on backend:", data);
  //     // TODO: store user info / token
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //   }
  // }







  return (
    <header className="site-header">
      {/* <GoogleOAuthProvider clientId="512847879646-rc53sf1m84t99athm9fi99rd32ig7ue9.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log("Login Failed")}
        />
      </GoogleOAuthProvider> */}
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
