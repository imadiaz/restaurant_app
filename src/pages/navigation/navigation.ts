import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Users, 
  HelpCircle,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/dashboard/orders', icon: ClipboardList },
  // { label: 'Payment', path: '/dashboard/payment', icon: CreditCard },
  // { label: 'Categories', path: '/dashboard/categories', icon: List },
  { label: 'Products', path: '/dashboard/products', icon: Package },
  // { label: 'Holiday Hours', path: '/dashboard/hours', icon: Clock },
  // { label: 'Pickup Times', path: '/dashboard/pickup', icon: Truck },
  { label: 'Users', path: '/dashboard/users', icon: Users },
  { label: 'Help', path: '/dashboard/help', icon: HelpCircle },
];