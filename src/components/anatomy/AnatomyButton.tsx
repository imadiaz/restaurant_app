import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AnatomyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean; // New prop to control loading state
}



const AnatomyButton: React.FC<AnatomyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = "", 
  disabled,
  ...props 
}) => {
  
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary hover:bg-primary-hover text-white shadow-md border-transparent",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 border shadow-sm",
  ghost: "bg-transparent hover:bg-primary/10 text-primary border-transparent"
};

  return (
    <button
      disabled={isLoading || disabled} // Disable if loading OR if explicitly disabled
      className={`
        relative w-full font-medium py-3 rounded-full transition-all 
        flex justify-center items-center
        ${variants[variant]}
        ${(isLoading || disabled) ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {/* If loading, show the spinner absolutely centered. 
         We keep the children rendered but invisible (opacity-0) so the button 
         maintains its exact width/height and doesn't jump.
      */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {/* Hide text when loading so it doesn't clash with the spinner */}
      <span className={isLoading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
    </button>
  );
};

export default AnatomyButton;