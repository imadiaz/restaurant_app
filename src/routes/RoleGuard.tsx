import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '../config/roles';


interface RoleGuardProps {
  allowedRoles: UserRole[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. If not logged in -> Login Page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but WRONG ROLE -> Unauthorized Page
  // We cast user.role to ensure type safety with our config
  if (!allowedRoles.includes(user.role.name as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Permission Granted -> Render Content
  return <Outlet />;
};

export default RoleGuard;