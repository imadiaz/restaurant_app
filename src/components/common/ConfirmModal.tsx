import React, { useRef } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDialogAccessibility } from '../../hooks/use.dialog.accessibility';


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
  confirmText,
  cancelText,
  variant = 'info',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(isOpen, dialogRef, onClose);
  if (!isOpen) return null;

  // Variant Styles
  const variants = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-danger" />,
      bgIcon: 'bg-danger-surface',
      button: 'bg-danger hover:brightness-90 text-primary-contrast',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-warning" />,
      bgIcon: 'bg-warning-surface',
      button: 'bg-warning hover:brightness-90 text-primary-contrast',
    },
    info: {
      icon: <Info className="w-6 h-6 text-info" />,
      bgIcon: 'bg-info-surface',
      button: 'bg-info hover:brightness-90 text-primary-contrast',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-description">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Panel */}
      <div ref={dialogRef} tabIndex={-1} className="relative w-full max-w-md transform overflow-hidden rounded-card bg-background-card border border-border p-6 text-left shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label={t('common.close')}
          className="absolute right-4 top-4 text-text-subtle hover:text-text-main disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="sm:flex sm:items-start">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${currentVariant.bgIcon}`}>
            {currentVariant.icon}
          </div>

          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 id="confirm-modal-title" className="text-lg font-semibold leading-6 text-text-main">
              {title}
            </h3>
            <div className="mt-2">
              <p id="confirm-modal-description" className="text-sm text-text-muted">
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
            {isLoading ? t('common.processing') : (confirmText ?? t('common.confirm'))}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="mt-3 inline-flex w-full justify-center rounded-control bg-background-card px-3 py-2 text-sm font-semibold text-text-main shadow-sm ring-1 ring-inset ring-border hover:bg-surface-hover sm:mt-0 sm:w-auto disabled:opacity-50"
          >
            {cancelText ?? t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
