import { createContext, ReactNode, useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

interface DarkModeContextType {
    dark: boolean;
    toggleDarkMode: () => void;
}

// Context initialization with empty default values
export const DarkModeContext = createContext<DarkModeContextType>({
    dark: true,
    toggleDarkMode: () => {}
});

function DarkModeProvider({ children }: { children: ReactNode }) {
    const systemPrefersDark = useMediaQuery({
        query: '(prefers-color-scheme: dark)',
    });
    
    const [dark, setDark] = useState(systemPrefersDark);
    
    // Update dark mode when system preference changes (only if user hasn't manually set it)
    useEffect(() => {
        const savedPreference = localStorage.getItem('darkMode');
        if (savedPreference === null) {
            setDark(systemPrefersDark);
        }
    }, [systemPrefersDark]);
    
    // Load saved preference on mount
    useEffect(() => {
        const savedPreference = localStorage.getItem('darkMode');
        if (savedPreference !== null) {
            setDark(savedPreference === 'true');
        }
    }, []);
    
    // Apply theme class when dark mode state changes
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    }, [dark]);
    
    const toggleDarkMode = () => {
        const newDarkMode = !dark;
        setDark(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
        
        // Apply theme class to document
        if (newDarkMode) {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    };

    return (
        <DarkModeContext.Provider value={{ dark, toggleDarkMode }}>
        {children}
        </DarkModeContext.Provider>
    );
};

export default DarkModeProvider;
