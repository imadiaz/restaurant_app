import type { LucideIcon } from 'lucide-react';
import React from 'react';
import AnatomyButton from '../anatomy/AnatomyButton';

export interface ActionConfig {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: LucideIcon;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
}

interface AnatomyCardActionsProps {
  primary?: ActionConfig;
  secondary?: ActionConfig;
  tertiary?: ActionConfig; 
  reverse?: boolean;      
  className?: string;
}

const AnatomyCardActions: React.FC<AnatomyCardActionsProps> = ({ 
  primary, 
  secondary, 
  tertiary,
  reverse = false,
  className = "" 
}) => {
  
  if (!primary && !secondary && !tertiary) return null;
  const activeCount = [primary, secondary, tertiary].filter(Boolean).length;
  const renderButton = (action: ActionConfig, defaultVariant: 'primary' | 'secondary' | 'ghost') => {
    const Icon = action.icon;
    return (
      <AnatomyButton
        variant={action.variant || defaultVariant} 
        fullWidth
        onClick={(e: React.MouseEvent) => {
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

  const gridCols = `grid-cols-${activeCount}`;

  return (
    <div className={`grid ${gridCols} gap-3 pt-3 mt-auto border-t border-border ${className}`}>
      {reverse ? (
        <>
          {primary && renderButton(primary, 'primary')}
          {secondary && renderButton(secondary, 'secondary')}
          {tertiary && renderButton(tertiary, 'ghost')}
        </>
      ) : (
        <>
          {tertiary && renderButton(tertiary, 'ghost')}
          {secondary && renderButton(secondary, 'secondary')}
          {primary && renderButton(primary, 'primary')}
        </>
      )}
    </div>
  );
};

export default AnatomyCardActions;