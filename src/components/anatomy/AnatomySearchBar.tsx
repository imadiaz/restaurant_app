import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const AnatomySearchBar: React.FC<SearchBarProps> = ({ className = "", ...props }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="
          w-full py-3 pl-12 pr-4 
          bg-white border border-gray-200 rounded-xl 
          text-gray-700 placeholder-gray-400
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          transition-colors shadow-sm
        "
        placeholder="Search..."
        {...props}
      />
    </div>
  );
};

export default AnatomySearchBar;