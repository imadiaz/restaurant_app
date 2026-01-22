import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayoutStore } from '../../store/layout.store';
import { useAuthStore } from '../../store/auth.store';
import { NAV_ITEMS } from '../../navigation/navigation';



interface SidebarProps {
  mobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false }) => {
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // DERIVED STATE:
  // If we are in "mobile" mode, the sidebar should always look "expanded" (text visible),
  // because it lives inside a sliding drawer wrapper.
  // If desktop, we respect the global collapsed state.
  const isCollapsed = mobile ? false : isSidebarCollapsed;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`
        h-screen bg-background-sidebar border-r border-gray-200 flex flex-col justify-between
        transition-all duration-300 ease-in-out
        ${mobile ? 'w-full shadow-none' : `fixed left-0 top-0 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}
      `}
    >
      {/* --------------------------------------------------------------------------------
          1. HEADER / LOGO
         -------------------------------------------------------------------------------- */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200/50 bg-white/50 backdrop-blur-sm shrink-0">
        {isCollapsed ? (
          <span className="text-xl font-bold text-accent">UE</span>
        ) : (
          <span className="text-lg font-bold text-gray-800">
            Uber<span className="text-accent">Eats</span>
            <span className="text-xs font-normal text-gray-500 block -mt-1">
              for restaurants
            </span>
          </span>
        )}
      </div>

      {/* --------------------------------------------------------------------------------
          2. NAVIGATION LINKS
         -------------------------------------------------------------------------------- */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2 overflow-x-visible">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            // On mobile: Close the drawer when a link is clicked
            onClick={() => {
              if (mobile && window.innerWidth < 768) {
                // You might want to pass a 'onClose' prop from layout if you want explicit control,
                // but usually the Layout handles closing via state.
                // For now, we leave this passive or trigger the global toggle if your store manages mobile state.
              }
            }}
            className={({ isActive }) => `
              relative flex items-center py-3 px-4 transition-all duration-200 group cursor-pointer
              ${isActive 
                ? 'bg-primary text-white shadow-md shadow-primary/30' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-white'}
              ${isCollapsed ? 'justify-center mx-2 rounded-xl' : 'mx-0 rounded-r-full mr-4'}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Strip (Only when Expanded) */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                )}

                {/* Icon */}
                <item.icon
                  className={`
                    w-5 h-5 transition-colors shrink-0
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}
                    ${isCollapsed ? '' : 'mr-4'}
                  `}
                />

                {/* Text Label */}
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* TOOLTIP (Desktop Collapsed Only) 
                   - Shows on hover when sidebar is small
                   - Uses 'fixed' or 'absolute' logic to appear outside
                */}
                {isCollapsed && !mobile && (
                  <div
                    className="
                      absolute left-full top-1/2 -translate-y-1/2 ml-3
                      bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-xl
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none whitespace-nowrap z-50
                    "
                  >
                    {/* Tiny arrow pointing left */}
                    <div className="absolute top-1/2 left-0 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --------------------------------------------------------------------------------
          3. FOOTER (Toggle & Logout)
         -------------------------------------------------------------------------------- */}
      <div className="p-4 border-t border-gray-200 space-y-2 bg-white/30 shrink-0">
        
        {/* Collapse Toggle Button (Hidden on Mobile) */}
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group relative
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} className={isCollapsed ? '' : 'mr-3'} />
          
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}

          {/* Logout Tooltip (Collapsed Mode) */}
          {isCollapsed && !mobile && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 z-50 pointer-events-none whitespace-nowrap">
              Log Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;