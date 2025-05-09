import { createContext, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";

interface DarkModeContextType {
    dark: boolean;
}

// Context initialization with empty default values
export const DarkModeContext = createContext<DarkModeContextType>({dark: true});

function DarkModeProvider({ children }: { children: ReactNode }) {
    const isDarkMode = useMediaQuery({
        query: '(prefers-color-scheme: dark)',
    });

    return (
        <DarkModeContext.Provider value={{ dark: isDarkMode }}>
        {children}
        </DarkModeContext.Provider>
    );
};

export default DarkModeProvider;
