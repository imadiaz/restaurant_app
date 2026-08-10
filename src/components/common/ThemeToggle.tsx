import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/theme.store';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const toggleLabel = theme === 'dark'
    ? t('theme.switch_to_light', 'Switch to light theme')
    : t('theme.switch_to_dark', 'Switch to dark theme');

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-all duration-300 relative overflow-hidden
        bg-primary/10 text-primary hover:bg-primary/20
      `}
      title={toggleLabel}
      aria-label={toggleLabel}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-full h-full transform transition-transform duration-500 ${theme === 'dark' ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} 
        />
        <Moon 
          className={`absolute inset-0 w-full h-full transform transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
