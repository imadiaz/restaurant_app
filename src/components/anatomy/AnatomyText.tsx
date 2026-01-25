import React from 'react';


// Common interface for text props
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

// 1. H1 - Main Page Titles
// Old: text-gray-900 -> New: text-text-main
const H1: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <h1 className={`text-2xl font-bold text-text-main ${className}`} {...props}>
    {children}
  </h1>
);

// 2. H3 - Card Titles / Section Headers
// Old: text-gray-800 -> New: text-text-main
const H3: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-bold text-text-main ${className}`} {...props}>
    {children}
  </h3>
);

// 3. Subtitle - Descriptions under titles
// Old: text-gray-500 -> New: text-text-muted
const Subtitle: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-text-muted ${className}`} {...props}>
    {children}
  </p>
);

// 4. Body - Standard Paragraphs
// Old: text-gray-600 -> New: text-gray-600 dark:text-gray-300
// Note: We use specific colors here because 'muted' might be too faint for long reading text.
const Body: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

// 5. Label - Small Caps / Form Labels
// Old: text-gray-500 -> New: text-text-muted
const Label: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-xs font-bold text-text-muted uppercase tracking-wide ${className}`} {...props}>
    {children}
  </span>
);

// 6. Small - Footer text / Metadata
// Old: text-gray-500 -> New: text-text-muted
const Small: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-sm text-text-muted ${className}`} {...props}>
    {children}
  </span>
);

// 7. Link - Interactive text
// Uses 'text-primary' which we already defined as Orange/Green in CSS
const Link: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-sm font-medium text-primary cursor-pointer hover:underline ${className}`} {...props}>
    {children}
  </span>
);

// Export as a Compound Component
const AnatomyText = {
  H1,
  H3,
  Subtitle,
  Body,
  Label,
  Small,
  Link
};

export default AnatomyText;