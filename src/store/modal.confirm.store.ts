import { create } from 'zustand';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  onConfirm: () => Promise<void> | void;
}

interface ConfirmState {
  isOpen: boolean;
  isLoading: boolean;
  options: ConfirmOptions | null;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  executeConfirm: () => Promise<void>;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  options: null,

  openConfirm: (options) => set({ isOpen: true, options, isLoading: false }),

  closeConfirm: () => set({ isOpen: false }),

  executeConfirm: async () => {
    const { options } = get();
    if (!options) return;

    set({ isLoading: true });
    try {
      await options.onConfirm();
      set({ isOpen: false }); 
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));