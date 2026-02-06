import React from 'react';
import { Loader2 } from 'lucide-react';


type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean; // <--- New Prop
  fullWidth?: boolean; // <--- New Prop
  className?: string;
  children: React.ReactNode;
}

const AnatomyButton: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading = false,
  fullWidth = false,
  className = "", 
  children, 
  disabled,
  ...props 
}) => {
  
  // 1. BASE STYLES
  // We switch between 'flex w-full' (for full width) and 'inline-flex' (for auto width)
  const layoutStyles = fullWidth ? "flex w-full" : "inline-flex";
  
  const baseStyles = `${layoutStyles} items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap`;

  // 2. VARIANTS
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/30 border border-transparent focus:ring-primary",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm focus:ring-gray-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 border border-transparent hover:text-gray-900",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading} // Disable if loading
      {...props}
    >
      {/* Show Spinner if loading */}
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      
      {children}
    </button>
  );
};

export default AnatomyButton;