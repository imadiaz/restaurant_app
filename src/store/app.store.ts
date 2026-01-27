import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Restaurant } from '../data/models/restaurant/restaurant';


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