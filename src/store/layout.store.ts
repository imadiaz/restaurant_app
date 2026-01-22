import { create } from 'zustand';

interface LayoutState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarCollapsed: false, // Default to expanded
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}));