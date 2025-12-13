import { Link, NavLink, useLocation } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import { DarkModeContext } from '../../contexts/DarkModeContext';

interface StickyNavProps {
  /** Array of category names for navigation */
  sections: string[];
}

/**
 * Sticky navigation bar that appears below the header
 * - Shows category navigation buttons
 * - Small logo on the right that navigates to home or scrolls to top
 * - Only appears when header is scrolled out of view
 */
function StickyNav({ sections }: StickyNavProps) {
  const darkMode: boolean = useContext(DarkModeContext).dark;
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Use IntersectionObserver to detect when header leaves viewport
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    const setupObserver = () => {
      // Try to find the header element - exclude the newspaper-masthead (print view header)
      const allHeaders = document.querySelectorAll('header');
      
      // Find the actual visible header (not the newspaper-masthead)
      // The real header should have actual dimensions and be visible
      let header: HTMLElement | null = null;
      
      for (const h of Array.from(allHeaders)) {
        const rect = h.getBoundingClientRect();
        const computed = window.getComputedStyle(h);
        const isNewspaperMasthead = h.classList.contains('newspaper-masthead');
        const hasDimensions = rect.height > 0 && rect.width > 0;
        const isVisible = computed.display !== 'none' && computed.visibility !== 'hidden';
        
        // Select header that is NOT newspaper-masthead and has actual dimensions
        if (!isNewspaperMasthead && hasDimensions && isVisible) {
          header = h as HTMLElement;
          break;
        }
      }
      
      // Fallback: try to find header that's not newspaper-masthead
      if (!header) {
        header = document.querySelector('header:not(.newspaper-masthead)') as HTMLElement | null;
      }
      
      if (!header) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return;
        }
        // Retry after a short delay if header not found
        timeoutId = setTimeout(setupObserver, 100);
        return;
      }

      // Use IntersectionObserver to detect when header enters/leaves viewport
      // rootMargin: '0px' means we check if header intersects with viewport
      // threshold: 0 means trigger when ANY part of header enters/leaves viewport
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Header is visible if it's intersecting with the viewport
            const visible = entry.isIntersecting;
            setIsHeaderVisible(visible);
          });
        },
        {
          root: null, // Use viewport as root
          rootMargin: '0px',
          threshold: 0 // Trigger when any part of header enters/leaves viewport
        }
      );

      try {
        observer.observe(header);
        
        // Force an initial check by manually triggering intersection
        // IntersectionObserver might not fire immediately
        const manualCheck = () => {
          const rect = header.getBoundingClientRect();
          const visible = rect.bottom > 0 && rect.top < window.innerHeight;
          setIsHeaderVisible(visible);
        };
        
        // Check immediately and after a short delay
        manualCheck();
        setTimeout(manualCheck, 100);
        setTimeout(manualCheck, 500);
      } catch (error) {
        // Silently handle errors
      }
    };

    setupObserver();
    
    // Also add scroll listener as backup
    const scrollBackup = () => {
      // Find the correct header (not newspaper-masthead)
      const header = document.querySelector('header:not(.newspaper-masthead)') as HTMLElement | null;
      if (header) {
        const rect = header.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        setIsHeaderVisible(visible);
      }
    };
    
    window.addEventListener('scroll', scrollBackup, { passive: true });

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', scrollBackup);
    };
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Don't render if header is still visible
  if (isHeaderVisible) {
    return null;
  }

  return (
    <nav className={`sticky top-0 z-50 w-full border-b border-[#cc0000] transition-all duration-300 ${
      darkMode ? 'bg-black' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between w-full px-4 py-1.5">
        <div className="flex items-center justify-center flex-1 gap-2 max-[600px]:gap-1.5 overflow-x-auto">
          {sections.map((section) => (
            <NavLink 
              key={"sticky_nav_link_" + section}
              to={`/category/${section.toLowerCase()}`}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''} whitespace-nowrap`
              }
            >
              <div 
                className="px-2 py-1 rounded-lg 
                            border-b-[0.15rem] border-transparent transition-all duration-300 
                            ease-in-out hover:border-b-[0.15rem] hover:border-[var(--title-color)]
                            hover:bg-[darkgray] hover:shadow-md active:border-b-[0.15rem] 
                            active:border-[var(--title-color)] active:bg-[darkgray] font-medium text-xs"
                style={{ 
                  color: 'var(--title-color, ' + (darkMode ? 'white' : 'black') + ')',
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {section}
              </div>  
            </NavLink>
          ))}
        </div>
        <div className="shrink-0 ml-2">
          <Link to="/" onClick={handleLogoClick}>
            <img 
              src={darkMode ? "/longMainWhiteLogo.png" : "/longMainBlackLogo.png"} 
              className="h-[56px] w-auto cursor-pointer transition-opacity duration-300 hover:opacity-80 max-w-[200px]" 
              alt="Logo" 
              style={{ height: '28px', maxWidth: '200px' }}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default StickyNav;

