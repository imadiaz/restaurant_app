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
    default: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    primary: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    error:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
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