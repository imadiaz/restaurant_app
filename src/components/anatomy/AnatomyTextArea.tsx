import React from 'react';
import AnatomyText from './AnatomyText';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const AnatomyTextArea: React.FC<TextAreaProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <AnatomyText.Label className="mb-2 block">{label}</AnatomyText.Label>}
      <textarea
        className={`
          w-full p-3 border border-gray-200 rounded-xl
          focus:ring-1 focus:ring-primary focus:border-primary outline-none
          transition-all resize-none text-gray-700 placeholder-gray-400 text-sm
          bg-white shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default AnatomyTextArea;