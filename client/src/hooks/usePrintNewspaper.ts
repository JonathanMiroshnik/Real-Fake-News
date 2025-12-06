import { useState, useEffect } from 'react';
import { debugLog } from '../utils/debugLogger';

/**
 * Custom hook that detects print events and manages print mode state
 * When print is triggered, sets isPrintMode to true
 * After printing, restores normal view
 */
export function usePrintNewspaper() {
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    // Method 1: Listen to beforeprint event
    const handleBeforePrint = () => {
      debugLog('🖨️ [Print] beforeprint event - switching to newspaper view');
      setIsPrintMode(true);
    };

    const handleAfterPrint = () => {
      debugLog('🖨️ [Print] afterprint event - restoring normal view');
      // Small delay to ensure print preview is closed
      setTimeout(() => {
        setIsPrintMode(false);
      }, 100);
    };

    // Method 2: Use media query listener (more reliable for print preview)
    const mediaQuery = window.matchMedia('print');
    
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isPrint = e.matches;
      debugLog('🖨️ [Print] Media query changed:', isPrint);
      setIsPrintMode(isPrint);
    };

    // Method 3: Poll for print media query (fallback for browsers that don't fire events)
    let pollInterval: number | null = null;
    const startPolling = () => {
      pollInterval = window.setInterval(() => {
        if (mediaQuery.matches && !isPrintMode) {
          debugLog('🖨️ [Print] Poll detected print mode');
          setIsPrintMode(true);
        } else if (!mediaQuery.matches && isPrintMode) {
          debugLog('🖨️ [Print] Poll detected normal mode');
          setIsPrintMode(false);
        }
      }, 100);
    };

    // Add event listeners
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Check initial state
    handleMediaChange(mediaQuery);
    
    // Listen for media query changes (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }
    
    // Start polling as additional fallback
    startPolling();

    // Cleanup
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      if (pollInterval !== null) {
        clearInterval(pollInterval);
      }
    };
  }, [isPrintMode]);

  return isPrintMode;
}

