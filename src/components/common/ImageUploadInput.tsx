import React, { useState, useEffect } from 'react';
import { Camera, User } from 'lucide-react'; // Ajusta tus iconos
import { useToastStore } from '../../store/toast.store';

interface ImageUploadInputProps {
  onFileSelect: (file: File) => void;
    initialPreview?: string | null;
    label?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  onFileSelect,
  initialPreview = null,
  label = "Image",
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const addToast = useToastStore((state) => state.addToast);
  const [preview, setPreview] = useState<string | null>(initialPreview);

  useEffect(() => {
    setPreview(initialPreview);
  }, [initialPreview]);

  const validateAndEmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      addToast(`Image is too large ${maxSizeMB}MB.`, 'error');
      e.target.value = '';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      addToast(`Invalid format : ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`, 'error');
      e.target.value = ''; 
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  };

  return (
    <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center sticky top-6">
      <h3 className="mb-6 font-semibold text-lg">{label}</h3>
      
      <div className="relative group mb-6">
        <div className="w-40 h-40 rounded-full border-4 border-background shadow-inner overflow-hidden relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <input 
          type="file" 
          accept={allowedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-10"
          onChange={validateAndEmit}
        />
      </div>

      <p className="text-gray-500 text-sm px-4">
        Sube una foto profesional. MAX {maxSizeMB}MB.
        <br/>
        Formatos: {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
      </p>
    </div>
  );
};