import React from 'react';
import AnatomyText from './AnatomyText';

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
}

const AnatomySwitcher: React.FC<AnatomySwitcherProps> = ({ 
  label, 
  options, 
  value, 
  onChange,
  className = ""
}) => {
  return (
    <div className={className}>
      {label && <AnatomyText.Label className="mb-1.5 block">{label}</AnatomyText.Label>}
      
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-border">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${isActive 
                  ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm ring-1 ring-black/5' 
                  : 'text-text-muted hover:text-text-main hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}
              `}
            >
              {option.icon && <span className={isActive ? "text-primary" : "text-gray-400"}>{option.icon}</span>}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnatomySwitcher;