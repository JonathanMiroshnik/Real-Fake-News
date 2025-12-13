import { Link, NavLink } from 'react-router';
import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

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
    <header className="w-full mb-8 border-b border-[#cc0000]">
      {/* <GoogleOAuthProvider clientId="512847879646-rc53sf1m84t99athm9fi99rd32ig7ue9.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log("Login Failed")}
        />
      </GoogleOAuthProvider> */}
      <div className="flex flex-col items-center w-full">
        <div className="flex justify-center w-full mb-4">
          <h1 className="m-4 font-serif text-[80px] cursor-pointer 
                          will-change-[filter] transition-[filter] 
                          duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]">
            <Link to="/">
              <img src={darkMode ? "/mainWhiteLogo.png" : "/mainBlackLogo.png"} className="w-[15rem]" alt="Logo" />
            </Link>
          </h1>
        </div>
        <div className="flex items-center justify-center w-full relative 
                        max-[600px]:flex-col max-[600px]:gap-4">
          <nav className="flex items-center justify-center 
                          flex-1 gap-[60px] max-[600px]:grid max-[600px]:justify-items-center 
                          max-[600px]:grid-cols-2 max-[600px]:grid-rows-2 max-[600px]:flex-none 
                          max-[600px]:w-full max-[600px]:gap-4">
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
                  <div className="text-[var(--title-color)] px-5 py-3 rounded-lg 
                                  border-b-[0.2rem] border-transparent transition-all duration-300 
                                  ease-in-out hover:border-b-[0.2rem] hover:border-[var(--title-color)] 
                                  hover:bg-[darkgray] hover:shadow-md active:border-b-[0.2rem] 
                                  active:border-[var(--title-color)] active:bg-[darkgray] font-medium">
                    {section}
                  </div>  
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
