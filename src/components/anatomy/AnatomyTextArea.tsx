import React, { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const AnatomyTextArea: React.FC<TextAreaProps> = ({ label, className = "", ...props }) => {
  const generatedId = useId();
  const textareaId = props.id ?? generatedId;
  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className="mb-2 block text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>}
      <textarea
        className={`
          w-full p-3 border border-border rounded-control
          focus:ring-1 focus:ring-primary focus:border-primary outline-none
          transition-all resize-none text-text-main placeholder:text-text-subtle text-sm
          bg-input shadow-sm
          ${className}
        `}
        {...props}
        id={textareaId}
      />
    </div>
  );
};

export default AnatomyTextArea;
