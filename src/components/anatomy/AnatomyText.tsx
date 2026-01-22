import React from 'react';

// Base props for all text components
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

// 1. Main Page Title (e.g., "Login form")
const H1: React.FC<TextProps> = ({ children, className = "", ...props }) => {
  return (
    <h1 className={`text-3xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h1>
  );
};

// 2. Subtitles / Explainer Text (e.g., "Lorem Ipsum...")
const Subtitle: React.FC<TextProps> = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-gray-400 text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

// 3. Input Labels (e.g., "Username")
const Label: React.FC<TextProps> = ({ children, className = "", ...props }) => {
  return (
    <label className={`text-xs text-gray-500 font-medium block ${className}`} {...props}>
      {children}
    </label>
  );
};

// 4. Small / Footer Text (e.g., "End user agreement")
const Small: React.FC<TextProps> = ({ children, className = "", ...props }) => {
  return (
    <span className={`text-gray-500 text-sm ${className}`} {...props}>
      {children}
    </span>
  );
};

// 5. Interactive Links (e.g., "Forgot password?")
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}
const Link: React.FC<LinkProps> = ({ children, className = "", ...props }) => {
  return (
    <a 
      className={`font-bold text-sm hover:underline cursor-pointer ${className}`} 
      {...props}
    >
      {children}
    </a>
  );
};

// Export them all as a single object
const AnatomyText = {
  H1,
  Subtitle,
  Label,
  Small,
  Link,
};

export default AnatomyText;