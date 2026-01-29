import React from 'react';
import AnatomyText from './AnatomyText'; // Import the new text system


interface AnatomyTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

const AnatomyTextField: React.FC<AnatomyTextFieldProps> = ({ 
  label, 
  icon, 
  className = "",
  size = 'md', // Default to medium
  ...props 
}) => {
  
  // Define size-specific styles
  const sizeConfig = {
    sm: {
      input: "py-2 text-sm",        // Smaller vertical padding & font
      iconWrapper: "pl-3",          // Icon sits closer to edge
      paddingWithIcon: "pl-9",      // Tighter space for icon
      paddingNoIcon: "pl-3"         // Tighter standard padding
    },
    md: {
      input: "py-3 text-base",      // Original padding & font
      iconWrapper: "pl-4",          // Original position
      paddingWithIcon: "pl-11",     // Original spacing
      paddingNoIcon: "pl-4"         // Original standard padding
    }
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <AnatomyText.Label className={size === 'sm' ? 'text-xs' : 'text-sm'}>
          {label}
        </AnatomyText.Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 ${currentSize.iconWrapper} flex items-center pointer-events-none text-text-muted`}>
            {/* We can also optionally scale the icon down if size is small */}
            {size === 'sm' ? (
              <span className="scale-90 flex items-center">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
        
        {/* INPUT FIELD */}
        <input
          className={`
            w-full pr-4 border rounded-full font-medium transition-colors
            ${currentSize.input}

            /* Light Mode Colors */
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            
            /* Dark Mode Colors */
            dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
            
            /* Focus States */
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            
            /* Dynamic Left Spacing based on Icon presence and Size */
            ${icon ? currentSize.paddingWithIcon : currentSize.paddingNoIcon} 
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default AnatomyTextField;