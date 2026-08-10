// src/hooks/useAppNavigation.ts

import { useCallback } from "react";
import { useNavigate, type NavigateOptions } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { isSuperAdmin } from "../../data/models/user/utils/user.utils";


export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const superAdmin = isSuperAdmin(user);
  const prefix = superAdmin ? '/admin' : '/dashboard';

  const getPath = useCallback((relativePath: string) => {
    if (relativePath === '/login' || relativePath === '/404') {
      return relativePath;
    }
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${prefix}${cleanPath}`;
  }, [prefix]);
  const navigateTo = useCallback((path: string, options?: NavigateOptions) => {
    const fullPath = getPath(path);
    navigate(fullPath, options);
  }, [getPath, navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return { navigateTo, getPath, goBack };
};
