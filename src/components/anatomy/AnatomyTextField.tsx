import React from 'react';
import AnatomyText from './AnatomyText'; // Import the new text system

interface AnatomyTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode; // Changed from LucideIcon to ReactNode for flexibility
}

const AnatomyTextField: React.FC<AnatomyTextFieldProps> = ({ 
  label, 
  icon, 
  className = "",
  ...props 
}) => {
  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <AnatomyText.Label>
          {label}
        </AnatomyText.Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        
        {/* INPUT FIELD */}
        <input
          className={`
            w-full py-3 pr-4 border rounded-full font-medium transition-colors
            
            /* Light Mode Colors */
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            
            /* Dark Mode Colors */
            dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
            
            /* Focus States */
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            
            /* Spacing if icon exists */
            ${icon ? 'pl-11' : 'pl-4'} 
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default AnatomyTextField;