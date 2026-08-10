import React from 'react';
import { Check } from 'lucide-react';
import AnatomyText from './AnatomyText';

interface AnatomyCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const AnatomyCheckbox: React.FC<AnatomyCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ""
}) => {
  return (
    <label className={`flex items-center gap-2.5 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div 
          aria-hidden="true"
          className={`
            w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background
            ${checked 
              ? 'bg-primary border-primary' 
              : 'bg-input border-border-strong hover:border-primary/50'}
          `}
        >
          <Check 
            aria-hidden="true"
            className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} 
            strokeWidth={3}
          />
        </div>
      </div>
      
      {label && (
        <AnatomyText.Small className={`${checked ? 'text-text-main font-medium' : 'text-text-muted'}`}>
          {label}
        </AnatomyText.Small>
      )}
    </label>
  );
};

export default AnatomyCheckbox;
