import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  const generatedId = useId();
  const inputId = props.id ?? generatedId;

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-text-muted uppercase tracking-wide">
          {label}
        </label>
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
          id={inputId}
          type={showPassword ? "text" : "password"}
          className={`
            w-full py-3 border rounded-control font-medium transition-colors
            bg-input border-border text-text-main placeholder:text-text-subtle
            
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
          className="absolute inset-y-0 right-0 px-4 flex items-center text-text-subtle hover:text-text-main transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
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
