// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../service/authService';
import type { LoginCredentials } from '../data/models/auth/loginCredentials';
import { User } from '../data/models/auth/user';


interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // Call the Service
          const user = await authService.login(credentials);
          console.log("Logged in user:", user);
          // Update State on success
          set({ user, isAuthenticated: true, isLoading: false });
        
        } catch (err: any) {
          // Handle Error
          const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw err; // Re-throw if the UI needs to know it failed
        }
      },

      logout: () => {
        authService.logout(); // Fire and forget
        set({ user: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // Key in localStorage
      storage: createJSONStorage(() => localStorage), // Explicit storage definition
      
      // Advanced: We need to re-hydrate the plain JSON back into a User class instance
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          // Convert plain object back to Class instance so methods like .fullName work
          state.user = new User(state.user);
        }
      },
    }
  )
);