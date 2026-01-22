import React from 'react';
import type { LucideIcon } from 'lucide-react';
import AnatomyText from './AnatomyText'; // Import the new text system

interface AnatomyTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

const AnatomyTextField: React.FC<AnatomyTextFieldProps> = ({ 
  label, 
  icon: Icon, 
  className = "",
  ...props 
}) => {
  return (
    <div className={`w-full text-left space-y-1 ${className}`}>
      {/* Reusing the standardized Label */}
      {label && (
        <AnatomyText.Label className="ml-4">
          {label}
        </AnatomyText.Label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-800" />
          </div>
        )}
        
        <input
          className={`
            w-full py-3 pr-4 border border-gray-200 rounded-full 
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            transition-colors placeholder-gray-300
            ${Icon ? 'pl-12' : 'pl-4'} 
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default AnatomyTextField;