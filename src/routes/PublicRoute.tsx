import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();

  // If user is ALREADY logged in, send them straight to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, let them see the public page (Login)
  return <Outlet />;
};

export default PublicRoute;