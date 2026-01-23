import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'custom'; // Add 'custom'

export interface Toast {
  id: string;
  message?: string; // Optional now
  type: ToastType;
  duration?: number;
  content?: ReactNode; // <--- NEW: Allows custom components
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  addCustomToast: (content: ReactNode, duration?: number) => void; // <--- NEW Helper
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (message, type, duration = 3000) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration);
  },

  // NEW: Function to add our custom order card
  addCustomToast: (content, duration = 5000) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'custom', content, duration }]
    }));
    // We don't auto-close custom toasts by default, or set a longer duration
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
  
}));