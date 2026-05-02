import { createContext } from 'react';

interface DarkModeContextType {
  dark: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  dark: true,
  toggleDarkMode: () => {},
});
