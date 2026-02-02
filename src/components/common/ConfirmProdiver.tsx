import React from 'react';
import { useConfirmStore } from '../../store/modal.confirm.store';
import ConfirmModal from './ConfirmModal';


export const ConfirmProvider: React.FC = () => {
  const { 
    isOpen, 
    isLoading, 
    options, 
    closeConfirm, 
    executeConfirm 
  } = useConfirmStore();

  if (!options) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={closeConfirm}
      onConfirm={executeConfirm}
      isLoading={isLoading}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
    />
  );
};