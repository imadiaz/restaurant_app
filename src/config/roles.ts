import {
  ShoppingBag,
  Coffee,
  Users,
  Building2,
  Shield,
  Calendar,
  Album,
  Motorbike,
  Utensils,
  ChefHat,
  TicketPercent,
  Club,
  ChartArea,
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
      labelKey: "restaurants.restaurants",
      path: `/admin${Routes.Restaurants}`,
      icon: Building2,
    },
    { label: "All Users", labelKey: "users.title", path: `/admin${Routes.Users}`, icon: Shield },
    { label: "Restaurant categories", labelKey: "categories.title", path: `/admin/categories`, icon: ChefHat },
  ],
  RESTAURANT: [
    { label: "Dashboard", labelKey: "statistics.title", path: "/dashboard/home", icon: ChartArea },
    { label: 'Orders', labelKey: "orders.title", path: '/dashboard/orders', icon: ShoppingBag },
    { label: "Products", labelKey: "products.title", path: "/dashboard/products", icon: Coffee },
    { label: "Schedule", labelKey: "schedules.title", path: "/dashboard/schedule", icon: Calendar },
    { label: "Team", labelKey: "users.title", path: `/dashboard${Routes.Users}`, icon: Users },
    { label: "Drivers", labelKey: "drivers.title", path: `/dashboard${Routes.Drivers}`, icon: Motorbike },
    { label: "Group Products", labelKey: "modifiers.title", path: "/dashboard/modifiers", icon: Utensils },
    { label: "Menu Sections", labelKey: "menuSections.title", path: "/dashboard/menu-sections", icon: Album },
    { label: "Promotions", labelKey: "promotions.title", path: "/dashboard/promotions", icon: TicketPercent },
    { label: "Coupons", labelKey: "coupons.title", path: "/dashboard/coupons", icon: Club },
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
  return config ? MENUS[config.menuType] : [];
};
