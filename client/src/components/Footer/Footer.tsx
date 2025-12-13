import { useContext } from 'react';
import { Link, useLocation } from 'react-router';
import { DarkModeContext } from '../../contexts/DarkModeContext';

/**
 * Cross-site global footer component
 */
function Footer() {
  const darkMode: boolean = useContext(DarkModeContext).dark;
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className={`pb-8 border-t border-[#cc0000] text-center ${
      darkMode ? 'bg-gray-200 text-black' : 'bg-black text-white'
    }`} style={{ 
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      marginBottom: 0,
      marginTop: '3rem',
      paddingTop: '1rem'
    }}>
      <div className="flex justify-center mb-3 py-3">
        <Link to="/" onClick={handleLogoClick}>
          <img 
            src={darkMode ? "/longMainBlackLogo.png" : "/longMainWhiteLogo.png"} 
            className="w-[512px] h-auto" 
            alt="Real Fake News Logo" 
          />
        </Link>
      </div>
      <div className="mt-2 flex gap-3 justify-center">
        <a href="/disclaimer" className={`no-underline 
                                          transition-all duration-300 ease-in-out 
                                          hover:text-[#cc0000] px-2 py-1 rounded-lg text-sm
                                          ${darkMode 
                                            ? 'text-black hover:bg-[rgba(0,0,0,0.1)]' 
                                            : 'text-white hover:bg-[rgba(255,255,255,0.1)]'
                                          }`}>Disclaimer</a>
        <a href="/terms" className={`no-underline 
                                    transition-all duration-300 ease-in-out 
                                    hover:text-[#cc0000] px-2 py-1 rounded-lg text-sm
                                    ${darkMode 
                                      ? 'text-black hover:bg-[rgba(0,0,0,0.1)]' 
                                      : 'text-white hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}>Terms of Use</a>
        <a href="/contact" className={`no-underline 
                                       transition-all duration-300 ease-in-out 
                                       hover:text-[#cc0000] px-2 py-1 rounded-lg text-sm
                                       ${darkMode 
                                         ? 'text-black hover:bg-[rgba(0,0,0,0.1)]' 
                                         : 'text-white hover:bg-[rgba(255,255,255,0.1)]'
                                       }`}>Contact</a>
      </div>
      <p className={`${darkMode ? 'text-black' : 'text-white'} text-sm`}>© 2025 Real Fake News - Satirical AI-generated content.</p>
      <p className={`${darkMode ? 'text-black' : 'text-white'} text-sm`}>All rights reserved. Real Fake News is not responsible for the content of external sites.</p>
      <a href='https://github.com/JonathanMiroshnik/Real-Fake-News' 
         className={`no-underline 
                    transition-colors duration-300 ease-in-out 
                    hover:text-[#cc0000] block mt-4 text-center pb-4 ${
                      darkMode ? 'text-black' : 'text-white'
                    }`}>Check out the project on GitHub!</a>
    </footer>
  );
};

export default Footer;