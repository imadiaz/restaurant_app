import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import AnatomyButton from '../anatomy/AnatomyButton';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language; // 'en' or 'es'
    const nextLang = currentLang === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <AnatomyButton variant="ghost" onClick={toggleLanguage}>
      <Globe className="w-4 h-4 mr-2" />
      {i18n.language === 'en' ? 'ES' : 'EN'}
    </AnatomyButton>
  );
};

export default LanguageSwitcher;