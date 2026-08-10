import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import AnatomyText from './AnatomyText';
import { useTranslation } from 'react-i18next';

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
  placeholder,
  className = ""
}) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('forms.select_options');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;

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

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((open) => !open);
    }
    if (event.key === 'Escape') setIsOpen(false);
  };

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
        role="combobox"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={label ?? resolvedPlaceholder}
        className={`
          min-h-[42px] px-3 py-1.5 rounded-xl border bg-background-card transition-all cursor-pointer flex flex-wrap items-center gap-2
          ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border-strong'}
        `}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {selectedOptions.length === 0 && (
          <span className="text-text-muted text-sm py-1">{resolvedPlaceholder}</span>
        )}

        {selectedOptions.map((opt) => (
          <span 
            key={opt.value} 
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {opt.label}
            <button 
              type="button"
              onClick={(e) => removeOption(e, opt.value)}
              aria-label={t('forms.remove_option', { option: opt.label })}
              className="ml-1 hover:text-danger focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="ml-auto pl-2">
          <ChevronDown aria-hidden="true" className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                aria-label={t('forms.search_options')}
                placeholder={t('common.search')}
                className="w-full pl-9 pr-3 py-2 bg-input rounded-lg text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              />
            </div>
          </div>

          {/* Options List */}
          <div id={listboxId} role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors
                      ${isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-text-main hover:bg-surface-hover'}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check aria-hidden="true" className="w-4 h-4" />}
                  </button>
                );
              })
            ) : (
              <div role="status" className="p-4 text-center text-text-muted text-sm">
                {t('forms.no_results')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnatomyMultiSelect;
