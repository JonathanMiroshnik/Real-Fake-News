import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { JSX } from 'react';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;