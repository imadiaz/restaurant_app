import React from 'react';
import { Bell, Info, Menu, PanelLeft } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';



// Add a prop to accept the mobile toggle function
interface HeaderProps {
  onMobileMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuClick }) => {
  const user = useAuthStore((state) => state.user);
  const { toggleSidebar, isSidebarCollapsed } = useLayoutStore();
  

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      
      {/* LEFT SIDE: Toggle Buttons */}
      <div className="flex items-center gap-4">
        
        {/* MOBILE Toggle (Visible only on Mobile) */}
        <button 
          onClick={onMobileMenuClick} 
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* DESKTOP Toggle (Visible only on Desktop) */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:block p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          title="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
        </button>

        {/* Logo Text for Mobile Header */}
        <div className="md:hidden font-bold text-lg text-gray-800">
           Uber<span className="text-green-600">Eats</span>
        </div>
      </div>

      {/* RIGHT SIDE (Same as before) */}
      <div className="flex items-center gap-6 ml-auto">
        <div className="flex items-center gap-4 border-r border-gray-200 pr-6">
          <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full">
             <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer p-2 -mr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
             <img src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {user?.firstName || 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;