import { Link, NavLink } from 'react-router';
import { useContext } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import SlopMeter from '../SlopMeter/SlopMeter';
import PresenceIndicator from '../PresenceIndicator/PresenceIndicator';

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
    <header className="w-full mb-8 border-b border-[#cc0000]">
      {/* Indicator only — read-only, so it sits over the masthead instead of in the nav flow */}
      <div className="flex justify-end">
        <SlopMeter />
      </div>
      {/* <GoogleOAuthProvider clientId="512847879646-rc53sf1m84t99athm9fi99rd32ig7ue9.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log("Login Failed")}
        />
      </GoogleOAuthProvider> */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center w-full mb-4 relative">
          {/*
            Pinned to the logo's row, top-left, so the count sits level with the
            logo instead of under it. Absolute so it does not shift the centred
            logo off the page's centre line.
          */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 max-[600px]:static max-[600px]:translate-y-0 max-[600px]:mb-2">
            <PresenceIndicator />
          </div>
          <h1
            className="m-4 font-serif text-[80px] cursor-pointer 
                          will-change-[filter] transition-[filter] 
                          duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
          >
            <Link to="/">
              <img
                src={darkMode ? '/mainWhiteLogo.png' : '/mainBlackLogo.png'}
                className="w-[15rem]"
                alt="Logo"
              />
            </Link>
          </h1>
        </div>
        <div
          className="flex items-center justify-center w-full relative 
                        max-[600px]:flex-col max-[600px]:gap-4"
        >
          <nav
            className="flex items-center justify-center 
                          flex-1 gap-[60px] max-[600px]:grid max-[600px]:justify-items-center 
                          max-[600px]:grid-cols-2 max-[600px]:grid-rows-2 max-[600px]:flex-none 
                          max-[600px]:w-full max-[600px]:gap-4"
          >
            {sections.map((section) => (
              <NavLink
                key={'header_link_' + section}
                to={`/category/${section.toLowerCase()}`}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <div
                    className={`text-[var(--title-color)] px-6 py-4 font-medium min-w-[120px] text-center
                                    ${isActive ? 'border-b-2 border-[var(--title-color)]' : 'border-b-2 border-transparent'}`}
                  >
                    {section}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
      {/* <hr className="border-t border-[#cc0000] mt-4" /> */}
    </header>
  );
}

export default Header;
