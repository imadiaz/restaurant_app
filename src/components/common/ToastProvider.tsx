import React from 'react';
import { useToastStore } from '../../store/toast.store';
import { AnatomyToast } from '../anatomy/AnatomyToast';


export const ToastProvider: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <AnatomyToast toast={toast} />
        </div>
      ))}
    </div>
  );
};