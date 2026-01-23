import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import AnatomyText from './AnatomyText';
import { useToastStore, type Toast } from '../../store/toast.store';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const styles = {
  success: 'bg-white border-l-4 border-green-500 text-gray-800',
  error: 'bg-white border-l-4 border-red-500 text-gray-800',
  info: 'bg-white border-l-4 border-blue-500 text-gray-800',
  warning: 'bg-white border-l-4 border-orange-500 text-gray-800'
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-orange-500'
};

export const AnatomyToast: React.FC<{ toast: Toast }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const Icon = icons[toast.type];
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Trigger slide-out
    setTimeout(() => removeToast(toast.id), 300); // Remove after animation
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg border border-gray-100 min-w-[320px] max-w-md relative overflow-hidden transition-all duration-300 transform
        ${styles[toast.type]}
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColors[toast.type]}`} />
      
      <div className="flex-1 pr-6">
        <AnatomyText.Body className="font-medium text-sm">
          {toast.message}
        </AnatomyText.Body>
      </div>

      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Optional: Progress Bar for auto-close visual */}
      {toast.duration && toast.duration > 0 && (
         <div 
           className={`absolute bottom-0 left-0 h-0.5 ${iconColors[toast.type].replace('text-', 'bg-')}`}
           style={{ 
             width: '100%', 
             animation: `shrink ${toast.duration}ms linear forwards` 
           }} 
         />
      )}
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};