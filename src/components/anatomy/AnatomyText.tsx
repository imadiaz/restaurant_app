import React from 'react';


// Common interface for text props
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

// 1. Existing H1
const H1: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <h1 className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
    {children}
  </h1>
);

// --- NEW COMPONENT: H3 ---
const H3: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-bold text-gray-800 ${className}`} {...props}>
    {children}
  </h3>
);

// 2. Existing Subtitle
const Subtitle: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <p className={`text-gray-500 text-sm ${className}`} {...props}>
    {children}
  </p>
);

// --- NEW COMPONENT: BODY ---
const Body: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-gray-600 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

// 3. Existing Label
const Label: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-xs font-bold text-gray-500 uppercase tracking-wide ${className}`} {...props}>
    {children}
  </span>
);

// 4. Existing Small
const Small: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-sm text-gray-500 ${className}`} {...props}>
    {children}
  </span>
);

// 5. Existing Link (Optional, often useful)
const Link: React.FC<TextProps> = ({ children, className = "", ...props }) => (
  <span className={`text-sm font-medium text-primary cursor-pointer hover:underline ${className}`} {...props}>
    {children}
  </span>
);

// Export as a Compound Component
const AnatomyText = {
  H1,
  H3,       // <--- Don't forget to export this
  Subtitle,
  Body,     // <--- And this
  Label,
  Small,
  Link
};

export default AnatomyText;