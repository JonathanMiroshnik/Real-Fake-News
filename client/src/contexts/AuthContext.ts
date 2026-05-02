import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);
