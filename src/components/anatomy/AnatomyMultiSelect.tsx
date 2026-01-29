import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import AnatomyText from './AnatomyText';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface AnatomyMultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const AnatomyMultiSelect: React.FC<AnatomyMultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected objects for display
  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <AnatomyText.Label className="mb-1.5 block">{label}</AnatomyText.Label>}

      {/* Main Box */}
      <div 
        className={`
          min-h-[42px] px-3 py-1.5 rounded-xl border bg-background-card transition-all cursor-pointer flex flex-wrap items-center gap-2
          ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-gray-400 dark:hover:border-gray-500'}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-text-muted text-sm py-1">{placeholder}</span>
        )}

        {selectedOptions.map((opt) => (
          <span 
            key={opt.value} 
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {opt.label}
            <button 
              onClick={(e) => removeOption(e, opt.value)}
              className="ml-1 hover:text-red-500 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="ml-auto pl-2">
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-background-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Bar */}
          <div className="p-2 border-b border-border sticky top-0 bg-background-card">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-text-muted" />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div 
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors
                      ${isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-text-main hover:bg-gray-50 dark:hover:bg-gray-800'}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-text-muted text-sm">
                No results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnatomyMultiSelect;