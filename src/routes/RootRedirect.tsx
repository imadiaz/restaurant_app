// src/components/RootRedirect.tsx
import { Navigate } from 'react-router-dom';
import { ROLE_CONFIG, type UserRole } from '../config/roles'; // Import config
import { useAuthStore } from '../store/auth.store';


const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. Not Logged In? -> Go to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Configuration
  const userRole = user.role.name as UserRole;
  const config = ROLE_CONFIG[userRole];

  // 3. Role NOT recognized in config? -> Go to Unauthorized
  // This prevents infinite loops if the role is missing from 'roles.ts'
  if (!config) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Valid Role? -> Go to their assigned Home Page
  return <Navigate to={config.defaultRoute} replace />;
};

export default RootRedirect;