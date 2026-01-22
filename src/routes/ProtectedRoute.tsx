import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/auth.store';

// Optional: Define props to allow role-based protection later
interface ProtectedRouteProps {
  allowedRoles?: Array<'admin' | 'manager' | 'staff'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login, but save the current location they were trying to go to.
    // This allows you to send them back there after they login.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  // 2. (Optional) Check for Role Access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have permission (e.g. Staff trying to see Admin Settings)
    return <Navigate to="/unauthorized" replace />; // Or redirect to home
  }

  // 3. If all checks pass, render the child routes (The Layout/Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;