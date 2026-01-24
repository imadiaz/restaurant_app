import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  ownerName: string;
  stats: {
    totalOrders: number;
    totalRevenue: number;
  }
}

interface AppState {
  activeRestaurant: Restaurant | null;
  setActiveRestaurant: (restaurant: Restaurant | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeRestaurant: null,
      setActiveRestaurant: (restaurant) => set({ activeRestaurant: restaurant }),
    }),
    {
      name: 'app-context-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);