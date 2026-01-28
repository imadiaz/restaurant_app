import type { User } from "../user";
export const ROLES = {
  ADMIN: 1,
  RESTAURANT_ADMIN: 2,
  DRIVER: 3,
  CLIENT: 4,
  RESTAURANT_MANAGEMENT: 5
};

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  return user.firstName + ' ' + user.lastName || user.username || user.email || 'Usuario';
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role.id === ROLES.ADMIN;
};

export const isRestaurantAdmin = (user: User | null): boolean => {
  return user?.role.id === ROLES.RESTAURANT_ADMIN;
};
