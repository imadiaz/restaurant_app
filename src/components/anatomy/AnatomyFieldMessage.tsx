interface AnatomyFieldMessageProps {
  id: string;
  error?: string;
  helperText?: string;
}

const AnatomyFieldMessage: React.FC<AnatomyFieldMessageProps> = ({ id, error, helperText }) => {
  const message = error || helperText;
  if (!message) return null;

  return (
    <p
      id={id}
      role={error ? 'alert' : undefined}
      className={`mt-1.5 text-xs ${error ? 'font-medium text-danger' : 'text-text-muted'}`}
    >
      {message}
    </p>
  );
};

export default AnatomyFieldMessage;
