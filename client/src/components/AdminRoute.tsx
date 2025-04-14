import { Navigate } from "react-router";
import { useAuth } from "react-use-auth";
import { JSX } from "react/jsx-runtime";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};