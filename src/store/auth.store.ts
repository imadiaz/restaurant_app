import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../data/models/user/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setCredentials: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setCredentials: (user) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('app-context-storage');
        useAuthStore.persist.clearStorage();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
