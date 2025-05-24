// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import jwt from 'jsonwebtoken';

interface User {
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

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

    useEffect(() => {
        const checkAuth = async () => {
            if (user?.token) {
            try {
                // Verify token expiration
                const decoded = jwt.decode(user.token);
                if (decoded === null || typeof decoded === "string") {
                    return;
                }
                if (decoded?.exp === undefined) {
                    return;
                }
                
                if (decoded.exp * 1000 < Date.now()) {
                logout();
                }
            } catch (error) {
                logout();
            }
            }
        };

    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
    }, [user]);

  const login = (userData: User, token: string) => {
    const userWithToken = { ...userData, token };
    setUser(userWithToken);
    localStorage.setItem('user', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}