import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../data/models/user/user";
import { decodeExp } from "../config/auth.config";
import { useSocketStore } from "./socket.store";

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
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExp: null,
      isAuthenticated: false,

      setCredentials: (user, accessToken, refreshToken) => {
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
