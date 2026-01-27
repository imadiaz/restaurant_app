import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AnatomyText from './AnatomyText';

interface AnatomyTextFieldPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode; // Optional Icon for the LEFT side (e.g. Lock)
}

const AnatomyTextFieldPassword: React.FC<AnatomyTextFieldPasswordProps> = ({ 
  label, 
  icon, 
  className = "",
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <AnatomyText.Label>
          {label}
        </AnatomyText.Label>
      )}
      
      <div className="relative">
        {/* LEFT ICON (Optional, e.g. Lock) */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        
        {/* INPUT FIELD */}
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={`
            w-full py-3 border rounded-full font-medium transition-colors
            
            /* Light Mode */
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            
            /* Dark Mode */
            dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
            
            /* Focus */
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            
            /* Spacing: Left for icon, Right for Eye button */
            ${icon ? 'pl-11' : 'pl-4'} pr-12
          `}
        />

        {/* RIGHT TOGGLE BUTTON */}
        <button
          type="button" // Important: prevents form submission
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
          tabIndex={-1} // Skip tab index for smoother form navigation
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AnatomyTextFieldPassword;