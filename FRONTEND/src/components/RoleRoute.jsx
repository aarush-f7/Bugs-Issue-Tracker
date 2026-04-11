import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const RoleRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RoleRoute;
