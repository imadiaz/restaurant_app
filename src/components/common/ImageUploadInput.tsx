import React, { useEffect, useId, useState } from 'react';
import { Camera, Image as ImageIcon, User } from 'lucide-react';
import { useToastStore } from '../../store/toast.store';
import { useTranslation } from 'react-i18next';

interface ImageUploadInputProps {
  onFileSelect: (file: File) => void;
    initialPreview?: string | null;
    label?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  shape?: 'avatar' | 'square' | 'landscape';
  sticky?: boolean;
  disabled?: boolean;
  previewAlt?: string;
  className?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  onFileSelect,
  initialPreview = null,
  label,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  shape = 'avatar',
  sticky = true,
  disabled = false,
  previewAlt,
  className = '',
}) => {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('images.image');
  const addToast = useToastStore((state) => state.addToast);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>();
  const inputId = useId();
  const descriptionId = `${inputId}-description`;
  const preview = selectedPreview ?? initialPreview;

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  const validateAndEmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      const message = t('images.error_too_large', { maxSizeMB });
      setValidationError(message);
      addToast(message, 'error');
      e.target.value = '';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      const formats = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
      const message = t('images.error_invalid_format', { formats });
      setValidationError(message);
      addToast(message, 'error');
      e.target.value = ''; 
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setValidationError(undefined);
    setSelectedPreview(objectUrl);
    onFileSelect(file);
    e.target.value = '';
  };

  const previewShape = {
    avatar: 'h-40 w-40 rounded-full',
    square: 'h-40 w-40 rounded-2xl',
    landscape: 'h-36 w-full rounded-xl',
  }[shape];

  return (
    <div className={`bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center ${sticky ? 'sticky top-6' : ''} ${className}`}>
      <label htmlFor={inputId} className="mb-6 font-semibold text-lg">{resolvedLabel}</label>
      
      <div className="relative group mb-6">
        <div className={`${previewShape} border-4 border-background shadow-inner overflow-hidden relative bg-surface-muted flex items-center justify-center`}>
          
          {preview ? (
            <img 
              src={preview} 
              alt={previewAlt ?? t('images.preview_alt', { label: resolvedLabel })}
              className="w-full h-full object-cover" 
            />
          ) : (
            shape === 'avatar'
              ? <User aria-hidden="true" className="w-16 h-16 text-text-subtle" />
              : <ImageIcon aria-hidden="true" className="w-12 h-12 text-text-subtle" />
          )}
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera aria-hidden="true" className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <input 
          id={inputId}
          type="file" 
          accept={allowedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          onChange={validateAndEmit}
          aria-label={resolvedLabel}
          aria-describedby={descriptionId}
          aria-invalid={!!validationError}
          disabled={disabled}
        />
      </div>

      <p id={descriptionId} className={`text-sm px-4 ${validationError ? 'font-medium text-danger' : 'text-text-muted'}`} role={validationError ? 'alert' : undefined}>
        {validationError ?? t('images.upload_help', { maxSizeMB })}
        <br/>
        {t('images.allowed_formats', { formats: allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ') })}
      </p>
    </div>
  );
};
