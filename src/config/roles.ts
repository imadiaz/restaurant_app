import {
  ShoppingBag,
  Coffee,
  Users,
  Building2,
  Shield,
  Calendar,
  Menu,
  Album,
  Truck,
  Motorbike,
  Utensils,
} from "lucide-react";
import { Routes } from "./routes";

// 1. DEFINE ROLES (Prevent typos)
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "restaurant_admin",
  MANAGER: "restaurant_manager",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// 2. DEFINE MENU ITEMS (Centralized)
const MENUS = {
  GLOBAL: [
    {
      label: "Restaurants",
      path: `/admin${Routes.Restaurants}`,
      icon: Building2,
    },
    { label: "All Users", path: `/admin${Routes.Users}`, icon: Shield },
  ],
  RESTAURANT: [
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: "Products", path: "/dashboard/products", icon: Coffee },
    { label: "Schedule", path: "/dashboard/schedule", icon: Calendar },
    { label: "Team", path: `/dashboard${Routes.Users}`, icon: Users },
    { label: "Drivers", path: `/dashboard${Routes.Drivers}`, icon: Motorbike },
     { label: "Group Products", path: "/dashboard/modifiers", icon: Utensils },
    { label: "Menu Sections", path: "/dashboard/menu-sections", icon: Album },
  ],
};

// 3. ROLE CONFIGURATION
// This maps every role to their "Home Page" and "Menu Type"
export const ROLE_CONFIG: Record<
  UserRole,
  { defaultRoute: string; menuType: "GLOBAL" | "RESTAURANT" }
> = {
  [ROLES.SUPER_ADMIN]: {
    defaultRoute: "/admin/restaurants",
    menuType: "GLOBAL",
  },
  [ROLES.ADMIN]: {
    defaultRoute: "/dashboard/orders",
    menuType: "RESTAURANT",
  },
  [ROLES.MANAGER]: {
    defaultRoute: "/dashboard/orders",
    menuType: "RESTAURANT",
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
