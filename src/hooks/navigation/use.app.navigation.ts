// src/hooks/useAppNavigation.ts

import { useNavigate, type NavigateOptions } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { isSuperAdmin } from "../../data/models/user/utils/user.utils";


export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const superAdmin = isSuperAdmin(user);
  const prefix = superAdmin ? '/admin' : '/dashboard';

  const getPath = (relativePath: string) => {
    if (relativePath === '/login' || relativePath === '/404') {
      return relativePath;
    }
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${prefix}${cleanPath}`;
  };
  const navigateTo = (path: string, options?: NavigateOptions) => {
    const fullPath = getPath(path);
    navigate(fullPath, options);
  };

  const goBack = () => {
    navigate(-1);
  };

  return { navigateTo, getPath, goBack };
};