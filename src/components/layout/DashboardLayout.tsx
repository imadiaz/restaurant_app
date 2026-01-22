import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useLayoutStore } from '../../store/layout.store';
import Header from './Header';
import Sidebar from './Sidebar';


const DashboardLayout: React.FC = () => {
  const { isSidebarCollapsed } = useLayoutStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Local state for mobile drawer

  // Helper to close mobile menu when clicking backdrop
  const handleMobileClose = () => setIsMobileOpen(false);
  
  // Helper to toggle mobile menu from Header
  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans">
      
      {/* ----------------------------------------------------
          1. MOBILE SIDEBAR (Drawer)
          Visible only on small screens (< md).
          It slides in from the left.
         ---------------------------------------------------- */}
      <div className={`md:hidden fixed inset-0 z-50 ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        
        {/* Backdrop (Dark Overlay) */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleMobileClose}
        />

        {/* The Sidebar itself */}
        <div className={`absolute left-0 top-0 bottom-0 w-64 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <Sidebar mobile /> {/* We pass a prop to force standard width style */}
        </div>
      </div>

      {/* ----------------------------------------------------
          2. DESKTOP SIDEBAR
          Visible only on medium+ screens (md:block).
          It stays fixed on the left.
         ---------------------------------------------------- */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ----------------------------------------------------
          3. MAIN CONTENT AREA
          We push this div to the right using 'ml-...' so the
          fixed sidebar doesn't cover the text.
         ---------------------------------------------------- */}
      <div 
        className={`
          flex flex-col min-h-screen transition-all duration-300 ease-in-out
          
          /* MOBILE: No margin (Sidebar is an overlay) */
          ml-0 
          
          /* DESKTOP: Add margin equal to Sidebar width */
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        {/* Pass the toggle function to Header so the button works */}
        <Header onMobileMenuClick={handleMobileToggle} />

        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet /> 
        </main>
      </div>
      
    </div>
  );
};

export default DashboardLayout;