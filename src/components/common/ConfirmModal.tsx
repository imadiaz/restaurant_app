import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';


interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Variant Styles
  const variants = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      bgIcon: 'bg-red-100 dark:bg-red-900/30',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bgIcon: 'bg-amber-100 dark:bg-amber-900/30',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      bgIcon: 'bg-blue-100 dark:bg-blue-900/30',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="sm:flex sm:items-start">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${currentVariant.bgIcon}`}>
            {currentVariant.icon}
          </div>

          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto ${currentVariant.button} disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;