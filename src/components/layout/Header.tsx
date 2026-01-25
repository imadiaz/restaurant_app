import React from 'react';
import { Bell, Info, Menu, PanelLeft } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import ThemeToggle from '../common/ThemeToggle';


interface HeaderProps {
  onMobileMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuClick }) => {
  const user = useAuthStore((state) => state.user);
  const { toggleSidebar, isSidebarCollapsed } = useLayoutStore();

  return (
    <header className="h-16 bg-background-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      
      {/* LEFT SIDE: Toggle Buttons */}
      <div className="flex items-center gap-4">
        
        {/* MOBILE Toggle (Visible only on Mobile) */}
        <button 
          onClick={onMobileMenuClick} 
          className="md:hidden p-2 hover:bg-background rounded-lg text-text-muted transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* DESKTOP Toggle (Visible only on Desktop) */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:block p-2 hover:bg-background rounded-lg text-text-muted hover:text-text-main transition-colors"
          title="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
        </button>

        {/* Logo Text for Mobile Header */}
        <div className="md:hidden font-bold text-lg text-text-main">
           Uber<span className="text-primary">Eats</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6 ml-auto">
        
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications & Info */}
        <div className="flex items-center gap-4 border-r border-border pr-6">
          <button className="relative p-2 text-text-muted hover:bg-background hover:text-text-main rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-card"></span>
          </button>
          
          <button className="p-2 text-text-muted hover:bg-background hover:text-text-main rounded-full transition-colors">
             <Info className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer p-2 -mr-2 hover:bg-background rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
             <img 
               src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"} 
               alt="User" 
               className="w-full h-full object-cover" 
             />
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-text-main leading-none">
              {user?.firstName || 'Admin'}
            </p>
            {/* Optional Role Subtext */}
            <p className="text-xs text-text-muted mt-0.5 capitalize">
              {user?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;