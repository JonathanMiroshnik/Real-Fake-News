// import { useEffect, createContext, useState, ReactNode } from "react";

// interface AuthContextType {
//   isAuthenticated: boolean;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// function AuthProvider({ children }: { children: ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const login = async (username: string, password: string) => {
//     const response = await fetch('/api/admin/login', {
//       method: 'POST',
//       credentials: 'include',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password })
//     });
    
//     if (!response.ok) throw new Error('Login failed');
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     document.cookie = 'adminToken=; Max-Age=0; path=/;';
//     setIsAuthenticated(false);
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         await fetch('/api/admin/validate', { credentials: 'include' });
//         setIsAuthenticated(true);
//       } catch {
//         setIsAuthenticated(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;