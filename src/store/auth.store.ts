import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../data/models/user/user";
import { decodeExp } from "../config/auth.config";
import { useSocketStore } from "./socket.store";
import queryClient from "../config/query.client.config";
import { useAppStore } from "./app.store";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExp: number | null;
  isAuthenticated: boolean;
  setCredentials: (user: User,accessToken: string, refreshToken: string) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExp: null,
      isAuthenticated: false,

      setCredentials: (user, accessToken, refreshToken) => {
        if (get().user?.id !== user.id) {
          void queryClient.cancelQueries();
          queryClient.clear();
          useAppStore.getState().setActiveRestaurant(null);
        }
        set({
          user,
          accessToken,
          refreshToken,
          accessTokenExp: decodeExp(accessToken),
          isAuthenticated: true,
        });
      },

      updateTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          accessTokenExp: decodeExp(accessToken),
          isAuthenticated: true,
        });
      },

      logout: () => {
        useSocketStore.getState().disconnect();
        void queryClient.cancelQueries();
        queryClient.clear();
        useAppStore.getState().setActiveRestaurant(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExp: null,
          isAuthenticated: false,
        });
        useAuthStore.persist.clearStorage();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
