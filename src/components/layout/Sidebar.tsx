import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, BarChart3, Building2, Coffee, LayoutDashboard, Settings, Shield, ShoppingBag, Users } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import { NAV_ITEMS } from '../../pages/navigation/navigation';
import { useAppStore } from '../../store/app.store';
import AnatomyText from '../anatomy/AnatomyText';
import { getMenuForRole, ROLES, type UserRole } from '../../config/roles';



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

  // DECIDE WHICH MENU TO SHOW
  // If we are a Super Admin AND we are NOT impersonating a restaurant -> Show Global Menu
  // Otherwise -> Show Restaurant Menu
  const menuItems = user 
    ? getMenuForRole(user.role as UserRole, !!activeRestaurant) 
    : [];

  const isActive = (path: string) => location.pathname.includes(path);

  const getSidebarTitle = () => {
  if (activeRestaurant) return activeRestaurant.name; // "Burger King"
  
  // Fallback: If no restaurant is loaded yet
  if (user?.role === ROLES.SUPER_ADMIN) return 'Super Admin Panel';
  
  // If I am a normal admin but data hasn't loaded
  return 'Restaurant'; 
};

  return (
    <div className={`
      h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300
      ${mobile ? 'w-full' : (isSidebarCollapsed ? 'w-20' : 'w-64')}
    `}>
      
      {/* LOGO AREA */}
      <div className="h-20 flex items-center justify-center border-b border-gray-50 px-4">
        
        {/* LOGO LOGIC */}
        {activeRestaurant && activeRestaurant.logo ? (
          // 1. If we have a restaurant AND a logo -> Show Circle Image
          <img 
            src={activeRestaurant.logo} 
            alt={activeRestaurant.name}
            className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white bg-gray-100 shrink-0"
          />
        ) : (
          // 2. Fallback: Show Initial Letter in a Colored Box
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-primary/30 shadow-lg shrink-0">
            {activeRestaurant ? activeRestaurant.name.charAt(0).toUpperCase() : 'A'}
          </div>
        )}

        {/* TITLE TEXT */}
        {(!isSidebarCollapsed || mobile) && (
          <div className="ml-3 overflow-hidden">
             <AnatomyText.Body className="text-sm font-bold truncate leading-tight">
               {getSidebarTitle()}
             </AnatomyText.Body>
             {/* Optional: Add a small label if it's a restaurant */}
             {activeRestaurant && (
               <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">
                 Restaurant
               </p>
             )}
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