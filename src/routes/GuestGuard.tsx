import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROLE_CONFIG, type UserRole } from '../config/roles';


const GuestGuard: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const userRole = user.role as UserRole;
    const config = ROLE_CONFIG[userRole];

    // 🛑 STOP THE LOOP
    // If the role is valid but has no config (e.g. "fake_role"), 
    // DO NOT send them to dashboard. Send to Unauthorized.
    if (!config) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Otherwise, send to their configured home
    return <Navigate to={config.defaultRoute} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;