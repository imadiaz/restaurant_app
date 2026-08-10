import React from 'react';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface AnatomyTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

const AnatomyTag: React.FC<AnatomyTagProps> = ({ 
  children, 
  variant = 'default', 
  className = "", 
  ...props 
}) => {
  
  const variants = {
    default: "bg-surface-muted text-text-muted border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success-surface text-success border-success/20",
    warning: "bg-warning-surface text-warning border-warning/20",
    error: "bg-danger-surface text-danger border-danger/20",
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
        ${variants[variant]}
        ${className}
      `} 
      {...props}
    >
      {children}
    </span>
  );
};

export default AnatomyTag;
