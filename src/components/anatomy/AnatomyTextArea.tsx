import React, { useId } from 'react';
import AnatomyFieldMessage from './AnatomyFieldMessage';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AnatomyTextArea: React.FC<TextAreaProps> = ({ label, className = "", error, helperText, 'aria-describedby': ariaDescribedBy, ...props }) => {
  const generatedId = useId();
  const textareaId = props.id ?? generatedId;
  const messageId = `${textareaId}-message`;
  const describedBy = [ariaDescribedBy, error || helperText ? messageId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className="mb-2 block text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>}
      <textarea
        className={`
          w-full p-3 border rounded-control
          ${error ? 'border-danger' : 'border-border'}
          focus:ring-1 focus:ring-primary focus:border-primary outline-none
          transition-all resize-none text-text-main placeholder:text-text-subtle text-sm
          bg-input shadow-sm
          ${className}
        `}
        {...props}
        id={textareaId}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={describedBy}
      />
      <AnatomyFieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
};

export default AnatomyTextArea;
