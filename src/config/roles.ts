import { 
  LayoutDashboard, ShoppingBag, Coffee, Users, 
  Settings, Building2, BarChart3, Shield, 
  Calendar
} from 'lucide-react';

// 1. DEFINE ROLES (Prevent typos)
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'restaurant_admin',
  MANAGER: 'manager',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// 2. DEFINE MENU ITEMS (Centralized)
const MENUS = {
  GLOBAL: [
    { label: 'Restaurants', path: '/admin/restaurants', icon: Building2 },
    { label: 'Global Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'All Users', path: '/admin/users', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  RESTAURANT: [
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Products', path: '/dashboard/products', icon: Coffee },
    { label: 'Team', path: '/dashboard/users', icon: Users },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
  ]
};

// 3. ROLE CONFIGURATION
// This maps every role to their "Home Page" and "Menu Type"
export const ROLE_CONFIG: Record<UserRole, { defaultRoute: string; menuType: 'GLOBAL' | 'RESTAURANT' }> = {
  [ROLES.SUPER_ADMIN]: { 
    defaultRoute: '/admin/restaurants', 
    menuType: 'GLOBAL' 
  },
  [ROLES.ADMIN]: { 
    defaultRoute: '/dashboard/orders', 
    menuType: 'RESTAURANT' 
  },
  [ROLES.MANAGER]: { 
    defaultRoute: '/dashboard/orders', 
    menuType: 'RESTAURANT' 
  },
};

// Helper to get menu based on role & context
export const getMenuForRole = (role: UserRole, isImpersonating: boolean) => {
  // If Super Admin is "Impersonating" (inside a restaurant), show Restaurant Menu
  if (role === ROLES.SUPER_ADMIN && isImpersonating) {
    return MENUS.RESTAURANT;
  }
  
  // Otherwise, look up the menu type in config
  const config = ROLE_CONFIG[role];
  return MENUS[config.menuType];
};