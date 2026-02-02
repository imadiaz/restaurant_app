import { useConfirmStore } from "../store/modal.confirm.store";

export const useConfirm = () => {
  const openConfirm = useConfirmStore((state) => state.openConfirm);

  const confirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'info' | 'warning';
    onConfirm: () => Promise<void> | void;
  }) => {
    openConfirm(options);
  };

  return { confirm };
};