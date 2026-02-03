import React from 'react';
import AnatomyText from './AnatomyText';

interface AnatomyTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  icon?: React.ReactNode;
  prefix?: string; // ✅ 1. Add prefix to interface
  size?: 'sm' | 'md';
}

const AnatomyTextField: React.FC<AnatomyTextFieldProps> = ({ 
  label, 
  icon, 
  prefix, // ✅ 2. Destructure prefix here
  className = "", 
  size = 'md', 
  ...props 
}) => {
  
  const sizeConfig = {
    sm: {
      input: "py-2 text-sm",
      iconWrapper: "pl-3",
      paddingWithIcon: "pl-9",
      paddingNoIcon: "pl-3",
      paddingWithPrefix: "pl-12",      // New: Space for just prefix
      paddingWithIconAndPrefix: "pl-20" // New: Space for Icon + Prefix
    },
    md: {
      input: "py-3 text-base",
      iconWrapper: "pl-4",
      paddingWithIcon: "pl-11",
      paddingNoIcon: "pl-4",
      paddingWithPrefix: "pl-14",       // New: Space for just prefix
      paddingWithIconAndPrefix: "pl-24" // New: Space for Icon + Prefix
    }
  };

  const currentSize = sizeConfig[size];

  // ✅ 3. Determine the correct padding based on what is present
  const getPaddingClass = () => {
    if (icon && prefix) return currentSize.paddingWithIconAndPrefix;
    if (icon) return currentSize.paddingWithIcon;
    if (prefix) return currentSize.paddingWithPrefix;
    return currentSize.paddingNoIcon;
  };

  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {label && (
        <AnatomyText.Label className={size === 'sm' ? 'text-xs' : 'text-sm'}>
          {label}
        </AnatomyText.Label>
      )}
      
      <div className="relative">
        {/* ✅ 4. Render Icon AND Prefix inside the absolute container */}
        {(icon || prefix) && (
          <div className={`absolute inset-y-0 left-0 ${currentSize.iconWrapper} flex items-center pointer-events-none text-text-muted`}>
            
            {/* Render Icon */}
            {icon && (
              <span className={`flex items-center ${size === 'sm' ? 'scale-90' : ''}`}>
                {icon}
              </span>
            )}

            {/* Render Prefix */}
            {prefix && (
              <span className={`font-medium text-text-muted ${icon ? 'ml-2' : ''} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                {prefix}
              </span>
            )}
          </div>
        )}
        
        <input
          className={`
            w-full pr-4 border rounded-full font-medium transition-colors
            ${currentSize.input}

            /* Light Mode */
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            
            /* Dark Mode */
            dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
            
            /* Focus */
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            
            /* ✅ Dynamic Padding applied here */
            ${getPaddingClass()} 
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default AnatomyTextField;