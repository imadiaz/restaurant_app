import React from 'react';
import AnatomySelect from './AnatomySelect';
import { Loader2 } from 'lucide-react';
import { useRoles } from '../../hooks/role/use.role';
import { useTranslation } from 'react-i18next';

interface AnatomyRolesSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  showAllOption?: boolean;
  valueMode?: 'id' | 'name';
}

const AnatomyRolesSelect: React.FC<AnatomyRolesSelectProps> = ({ 
  label, 
  showAllOption = false, 
  valueMode = 'name',
  className = '',
  disabled,
  ...props 
}) => {
  const {t} = useTranslation();
  const { roles, isLoading } = useRoles();
  if (isLoading) {
    return (
      <div className="absolute right-8 top-[38px] text-primary animate-spin">
          <Loader2 className="w-4 h-4" />
        </div>
    );
  }

  return (
    <AnatomySelect 
      label={label} 
      className={className} 
      disabled={disabled}
      {...props}
    >
      {showAllOption && <option value="All">{t('roles.all')}</option>}
      {!showAllOption && <option value="select">{t('roles.select_role')}</option>}

      {roles?.map((role) => (
        <option 
          key={role.id} 
          value={valueMode === 'id' ? role.id : role.name}
        >
          {role.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </option>
      ))}
    </AnatomySelect>
  );
};

export default AnatomyRolesSelect;