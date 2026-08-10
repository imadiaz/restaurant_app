import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'custom';

export interface Toast {
  id: string;
  message?: string;
  type: ToastType;
  duration?: number;
  content?: ReactNode;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  addCustomToast: (content: ReactNode, duration?: number, id?: string) => string;
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

  addCustomToast: (content, duration = 5000, providedId) => {
    const id = providedId ?? crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'custom', content, duration }]
    }));
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration);
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
  
}));
