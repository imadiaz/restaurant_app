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
  
  const baseStyles = `${layoutStyles} min-h-11 items-center justify-center px-6 py-2.5 rounded-control font-bold text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap`;

  // 2. VARIANTS
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-primary-contrast shadow-sm border border-transparent",
    secondary: "bg-background-card hover:bg-surface-hover text-text-main border border-border shadow-sm",
    ghost: "bg-transparent hover:bg-surface-muted text-text-muted border border-transparent hover:text-text-main",
    danger: "bg-danger-surface hover:brightness-95 text-danger border border-danger/20"
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
