import React from 'react';
import { ChevronDown } from 'lucide-react';
import AnatomyText from './AnatomyText';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const AnatomySelect: React.FC<SelectProps> = ({ label, children, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <AnatomyText.Label className="mb-2 block">{label}</AnatomyText.Label>}
      
      <div className="relative">
        <select
          className={`
            w-full p-3 pr-10 border border-gray-200 rounded-xl
            focus:ring-1 focus:ring-primary focus:border-primary outline-none
            bg-white text-gray-700 text-sm appearance-none shadow-sm cursor-pointer
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AnatomySelect;