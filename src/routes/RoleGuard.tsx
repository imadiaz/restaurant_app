import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// Define the roles available in your app
type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'delivery';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  redirectPath = '/', // Default redirect
  children 
}) => {
  // Get the current user from your auth store
  const { user, isAuthenticated } = useAuthStore();

  // 1. Check if user is logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // 2. Check if user has permission
  // We check if the user's role is included in the list of allowed roles
  if (!allowedRoles.includes(user.role as UserRole)) {
    // Optional: You could redirect to a specific "Unauthorized" page instead
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If everything is good, render the page
  // 'Outlet' is used if this component wraps a <Route> with nested children
  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;