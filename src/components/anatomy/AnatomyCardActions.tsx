import type { LucideIcon } from 'lucide-react';
import React from 'react';
import AnatomyButton from '../anatomy/AnatomyButton';

interface ActionConfig {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface AnatomyCardActionsProps {
  primary?: ActionConfig;
  secondary?: ActionConfig;
  reverse?: boolean;
  className?: string;
}

const AnatomyCardActions: React.FC<AnatomyCardActionsProps> = ({ 
  primary, 
  secondary, 
  reverse = false,
  className = "" 
}) => {
  
  if (!primary && !secondary) return null;

  const renderButton = (action: ActionConfig, variant: 'primary' | 'secondary') => {
    const Icon = action.icon;
    return (
      <AnatomyButton
        variant={variant}
        fullWidth
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(e);
        }}
        disabled={action.disabled}
        className="h-10 text-xs px-2 sm:px-4" 
      >
        {Icon && <Icon className="w-3.5 h-3.5 mr-2 shrink-0" />} 
        
        <span className="truncate">{action.label}</span>
      </AnatomyButton>
    );
  };

  return (
    <div className={`grid ${(primary && secondary) ? 'grid-cols-2' : 'grid-cols-1'} gap-3 pt-3 mt-auto border-t border-border ${className}`}>
      
      {reverse ? (
        <>
          {primary && renderButton(primary, 'primary')}
          {secondary && renderButton(secondary, 'secondary')}
        </>
      ) : (
        <>
          {secondary ? renderButton(secondary, 'secondary') : <div />}
          {primary && renderButton(primary, 'primary')}
        </>
      )}
    </div>
  );
};

export default AnatomyCardActions;