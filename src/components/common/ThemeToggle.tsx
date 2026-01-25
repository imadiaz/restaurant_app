import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/theme.store';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-all duration-300 relative overflow-hidden
        ${theme === 'dark' 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
          : 'bg-orange-100 text-orange-500 hover:bg-orange-200'}
      `}
      title="Toggle Theme"
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