import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useLayoutStore } from '../../store/layout.store';
import Header from './Header';
import Sidebar from './Sidebar';
import { Building2, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { useAuthStore } from '../../store/auth.store';



const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useLayoutStore();
  const { activeRestaurant, setActiveRestaurant } = useAppStore(); // Get Context
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuthStore();
  // --- HANDLERS ---
  const handleMobileClose = () => setIsMobileOpen(false);
  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);

  // EXIT IMPERSONATION
  const handleExitRestaurant = () => {
    setActiveRestaurant(null); // Clear the specific restaurant
    navigate('/admin/restaurants'); // Go back to global list
  };

  const showImpersonationBanner = user?.role === 'super_admin' && activeRestaurant;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans flex flex-col">
      
      {/* ----------------------------------------------------
          1. MOBILE SIDEBAR
         ---------------------------------------------------- */}
      <div className={`md:hidden fixed inset-0 z-50 ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleMobileClose}
        />
        <div className={`absolute left-0 top-0 bottom-0 w-64 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <Sidebar mobile />
        </div>
      </div>

      {/* ----------------------------------------------------
          2. DESKTOP SIDEBAR
         ---------------------------------------------------- */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-40">
        <Sidebar />
      </div>

      {/* ----------------------------------------------------
          3. MAIN CONTENT AREA
         ---------------------------------------------------- */}
      <div 
        className={`
          flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ml-0
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        
        {/* === SUPER ADMIN CONTEXT BANNER === 
            Only visible if we are currently looking at a specific restaurant
        */}
        {showImpersonationBanner && (
          <div className="bg-gray-900 text-white px-4 md:px-6 py-2 flex items-center justify-between shadow-md z-30 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg hidden sm:block">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Viewing As Admin</p>
                <p className="text-sm font-bold text-white leading-none">{activeRestaurant.name}</p>
              </div>
            </div>

            <button 
              onClick={handleExitRestaurant}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center text-white"
            >
              <ArrowLeft className="w-3 h-3 mr-2" />
              <span className="hidden sm:inline">Back to Global</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        )}

        {/* HEADER */}
        {/* We pass the toggle function */}
        <Header onMobileMenuClick={handleMobileToggle} />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet /> 
        </main>
      </div>
      
    </div>
  );
};

export default DashboardLayout;