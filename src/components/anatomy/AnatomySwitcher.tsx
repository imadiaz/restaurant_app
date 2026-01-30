import React from 'react';
import AnatomyText from './AnatomyText';
import { Loader2 } from 'lucide-react';


export interface SwitcherOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnatomySwitcherProps {
  label?: string;
  options: SwitcherOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean; 
}

const AnatomySwitcher: React.FC<AnatomySwitcherProps> = ({ 
  label, 
  options, 
  value, 
  onChange,
  className = "",
  isLoading = false,
  disabled = false
}) => {
  
  const isInteractive = !isLoading && !disabled;

  return (
    <div className={className}>
      {label && <AnatomyText.Label className="mb-1.5 block">{label}</AnatomyText.Label>}
      
      <div className={`flex p-1 rounded-xl bg-background border border-border transition-opacity duration-200 ${!isInteractive ? 'opacity-60 cursor-not-allowed' : ''}`}>
        {options.map((option) => {
          const isActive = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              disabled={!isInteractive}
              onClick={() => onChange(option.value)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden
                ${!isInteractive ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${isActive 
                  ? 'text-primary bg-background-card shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-text-muted hover:text-text-main hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}
              `}
            >
              {isLoading && isActive ? (
                 <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                 option.icon && <span className={isActive ? "text-primary" : "text-gray-400"}>{option.icon}</span>
              )}

              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnatomySwitcher;