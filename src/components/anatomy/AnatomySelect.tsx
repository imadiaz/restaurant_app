import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const AnatomySelect: React.FC<SelectProps> = ({ label, children, className = "", ...props }) => {
  const generatedId = useId();
  const selectId = props.id ?? generatedId;
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="mb-2 block text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>}
      
      <div className="relative">
        <select
          className={`
            w-full min-h-11 p-3 pr-10 border border-border rounded-control
            focus:ring-1 focus:ring-primary focus:border-primary outline-none
            bg-input text-text-main text-sm appearance-none shadow-sm cursor-pointer
            ${className}
          `}
          {...props}
          id={selectId}
        >
          {children}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-subtle">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AnatomySelect;
