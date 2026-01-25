import { useEffect } from 'react';
import { useThemeStore } from '../../store/theme.store';

const ThemeManager = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    
    root.style.colorScheme = theme;

  }, [theme]);

  return null;
};

export default ThemeManager;