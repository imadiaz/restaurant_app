import React from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import AnatomyText from '../anatomy/AnatomyText';
import { getMenuForRole, ROLES, type UserRole } from '../../config/roles';
import { useTranslation } from 'react-i18next';
import { useLogout } from '../../hooks/auth/use.logout';
import ManageCategoriesSection from '../../pages/restaurants/components/ManageCategoriesSection';
import ManageRestaurantSettingsSection from '../../pages/restaurants/components/ManageRestaurantSettingsSection';

interface SidebarProps {
  mobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed } = useLayoutStore();
  const {logout, isLoading} = useLogout();

  const handleLogout = async() => {
    await logout();
  };
  
  const { activeRestaurant } = useAppStore();
  const user = useAuthStore((state) => state.user);

  const menuItems = user 
    ? getMenuForRole(user.role.name as UserRole, !!activeRestaurant) 
    : [];

  const isActive = (path: string) => location.pathname.includes(path);

  const getSidebarTitle = () => {
    if (activeRestaurant) return activeRestaurant.name;
    if (user?.role.name === ROLES.SUPER_ADMIN) return 'Super Admin Panel';
    return t('restaurants.restaurants'); 
  };

  return (
    <div className={`
      h-full flex flex-col transition-all duration-300
      bg-background-sidebar border-r border-border
      ${mobile ? 'w-full' : (isSidebarCollapsed ? 'w-20' : 'w-64')}
    `}>
      
      <div className="h-20 flex items-center justify-center border-b border-border px-4">
        
        {activeRestaurant && activeRestaurant.logoUrl ? (
          <img 
            src={activeRestaurant.logoUrl} 
            alt={activeRestaurant.name}
            className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-600 bg-gray-100 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-primary/30 shadow-lg shrink-0">
            {activeRestaurant ? activeRestaurant.name.charAt(0).toUpperCase() : 'A'}
          </div>
        )}

        {(!isSidebarCollapsed || mobile) && (
          <div className="ml-3 overflow-hidden">
             <AnatomyText.Body className="text-sm font-bold truncate leading-tight text-text-main">
               {getSidebarTitle()}
             </AnatomyText.Body>
             
             {activeRestaurant && (
               <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider truncate">
                 {t('restaurants.restaurants')}
               </p>
             )}
          </div>
        )}
      </div>

      <div className="flex-1 py-6 space-y-2 overflow-y-auto px-3">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              w-full flex items-center p-3 rounded-xl transition-all duration-200 group
              ${isActive(item.path) 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-text-muted hover:bg-background hover:text-text-main'}
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

      <div>
        {activeRestaurant && <ManageRestaurantSettingsSection isSidebarCollapsed={isSidebarCollapsed} mobile={mobile}/>}
      </div>

      <div>
        {activeRestaurant && <ManageCategoriesSection isSidebarCollapsed={isSidebarCollapsed} mobile={mobile}  />}
      </div>

      <div className="p-4 border-t border-border">
        <button 
          disabled={isLoading}
          onClick={handleLogout}
          className={`
            w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
            ${isSidebarCollapsed && !mobile ? 'justify-center' : ''}
          `}
        >
          <LogOut className={`w-5 h-5 ${(!isSidebarCollapsed || mobile) ? 'mr-3' : ''}`} />
          {(!isSidebarCollapsed || mobile) && <span className="font-medium text-sm">{t('login.logout')}</span>}
        </button>
        <span className='text text-sm text-text-muted'>v.1.0.13</span>
      </div>

    </div>
  );
};

export default Sidebar;