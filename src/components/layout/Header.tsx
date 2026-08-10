import React from 'react';
import { Bell, Info, Menu, PanelLeft, User } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import ThemeToggle from '../common/ThemeToggle';
import { getUserDisplayName } from '../../data/models/user/utils/user.utils';
import { useTranslation } from 'react-i18next';


interface HeaderProps {
  onMobileMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuClick, isMobileMenuOpen = false }) => {
  const { t } = useTranslation();
  const currentUser = useAuthStore(state => state.user);
  const { toggleSidebar, isSidebarCollapsed } = useLayoutStore();

  return (
    <header className="h-16 bg-background-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      
      <div className="flex items-center gap-4">
        
        <button 
          onClick={onMobileMenuClick} 
          aria-label={t('navigation.open_menu', 'Open navigation menu')}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden p-2 hover:bg-background rounded-lg text-text-muted transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button 
          onClick={toggleSidebar} 
          className="hidden md:block p-2 hover:bg-background rounded-lg text-text-muted hover:text-text-main transition-colors"
          title={t('navigation.toggle_sidebar', 'Toggle sidebar')}
          aria-label={t('navigation.toggle_sidebar', 'Toggle sidebar')}
        >
          {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto">
        
        <ThemeToggle />

        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 border-r border-border pr-2 sm:pr-4 md:pr-6">
          <button aria-label={t('notifications.title', 'Notifications')} className="relative p-2 text-text-muted hover:bg-background hover:text-text-main rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-card"></span>
          </button>
          
          <button aria-label={t('common.information', 'Information')} className="p-2 text-text-muted hover:bg-background hover:text-text-main rounded-full transition-colors">
             <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer p-2 -mr-2 hover:bg-background rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
             {currentUser?.profileImageUrl ? (
               <img 
                 src={currentUser.profileImageUrl} 
                 alt={currentUser.username || t('users.user')}
                 className="w-full h-full object-cover" 
               />
             ) : (
               <User className="w-4 h-4 text-text-muted" />
             )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-text-main leading-none">
              {getUserDisplayName(currentUser) || 'Admin'}
            </p>
            <p className="text-xs text-text-muted mt-0.5 capitalize">
              {currentUser?.role.name?.replace('_', ' ') || t('users.user')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
