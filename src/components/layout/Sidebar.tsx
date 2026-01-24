import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, BarChart3, Building2, Coffee, LayoutDashboard, Settings, Shield, ShoppingBag, Users } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import { NAV_ITEMS } from '../../pages/navigation/navigation';
import { useAppStore } from '../../store/app.store';
import AnatomyText from '../anatomy/AnatomyText';



interface SidebarProps {
  mobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed } = useLayoutStore();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Get Super Admin context
  const { activeRestaurant } = useAppStore();
  
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'super_admin'; // MOCK for now

  // --- MENU CONFIGURATION ---
  
  // 1. Menu for Single Restaurant (Managers or Super Admin Impersonating)
  const RESTAURANT_MENU = [
    { label: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Products', path: '/dashboard/products', icon: Coffee },
    { label: 'Team', path: '/dashboard/users', icon: Users },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  // 2. Menu for Super Admin (Global View)
  const SUPER_ADMIN_MENU = [
    { label: 'Restaurants', path: '/admin/restaurants', icon: Building2 },
    { label: 'Global Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // DECIDE WHICH MENU TO SHOW
  // If we are a Super Admin AND we are NOT impersonating a restaurant -> Show Global Menu
  // Otherwise -> Show Restaurant Menu
  const menuItems = (isSuperAdmin && !activeRestaurant) 
    ? SUPER_ADMIN_MENU 
    : RESTAURANT_MENU;

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className={`
      h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300
      ${mobile ? 'w-full' : (isSidebarCollapsed ? 'w-20' : 'w-64')}
    `}>
      
      {/* LOGO AREA */}
      <div className="h-20 flex items-center justify-center border-b border-gray-50">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-primary/30 shadow-lg">
          {/* Change Logo based on context */}
          {activeRestaurant ? activeRestaurant.name.charAt(0) : 'A'}
        </div>
        {(!isSidebarCollapsed || mobile) && (
          <div className="ml-3">
             <AnatomyText.H3 className="text-base">
               {activeRestaurant ? 'Restaurant' : 'Admin Panel'}
             </AnatomyText.H3>
          </div>
        )}
      </div>

      {/* MENU ITEMS */}
      <div className="flex-1 py-6 space-y-2 overflow-y-auto px-3">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              w-full flex items-center p-3 rounded-xl transition-all duration-200 group
              ${isActive(item.path) 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              ${isSidebarCollapsed && !mobile ? 'justify-center' : ''}
            `}
          >
            <item.icon className={`w-5 h-5 ${(!isSidebarCollapsed || mobile) ? 'mr-3' : ''}`} />
            
            {(!isSidebarCollapsed || mobile) && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-50">
        <button className={`
          w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
          ${isSidebarCollapsed && !mobile ? 'justify-center' : ''}
        `}>
          <LogOut className={`w-5 h-5 ${(!isSidebarCollapsed || mobile) ? 'mr-3' : ''}`} />
          {(!isSidebarCollapsed || mobile) && <span onClick={handleLogout} className="font-medium text-sm">Logout</span>}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;