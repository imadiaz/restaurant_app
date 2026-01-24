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
          

          if (credentials.email === 'super@admin.com') {
            set({ 
              isLoading: false,
              user: { 
                id: '1', 
                email: credentials.email,
                firstName: 'Super', 
                lastName: 'Admin',
                role: 'super_admin',
                token: user.token,
                fullName: 'Super Admin',
              }, 
              isAuthenticated: true ,
              
            });
            return;
        }

        // B. Normal Admin (Has Restaurant ID)
        // This user belongs to "Burger King" (rest_01)
        set({ 
          isLoading: false,
          isAuthenticated: true, 
          user: { 
            id: '2', 
            email: credentials.email,
            firstName: 'Restaurant', 
            lastName: 'Owner',
            role: 'admin', 
            restaurantId: 'rest_01',
            token: user.token,
            fullName: 'Restaurant Owner',
          } 
        });
        
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