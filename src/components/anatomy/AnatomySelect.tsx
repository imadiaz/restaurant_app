import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import AnatomyFieldMessage from './AnatomyFieldMessage';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AnatomySelect: React.FC<SelectProps> = ({ label, children, className = "", error, helperText, 'aria-describedby': ariaDescribedBy, ...props }) => {
  const generatedId = useId();
  const selectId = props.id ?? generatedId;
  const messageId = `${selectId}-message`;
  const describedBy = [ariaDescribedBy, error || helperText ? messageId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="mb-2 block text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>}
      
      <div className="relative">
        <select
          className={`
            w-full min-h-11 p-3 pr-10 border rounded-control
            ${error ? 'border-danger' : 'border-border'}
            focus:ring-1 focus:ring-primary focus:border-primary outline-none
            bg-input text-text-main text-sm appearance-none shadow-sm cursor-pointer
            ${className}
          `}
          {...props}
          id={selectId}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={describedBy}
        >
          {children}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-subtle">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      <AnatomyFieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
};

export default AnatomySelect;
