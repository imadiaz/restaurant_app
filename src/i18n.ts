import i18n, { type BackendModule, type ReadCallback } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const supportedLanguages = ['en', 'es'] as const;
type SupportedLanguage = typeof supportedLanguages[number];

const normalizeLanguage = (language: string): SupportedLanguage =>
  language.toLowerCase().startsWith('es') ? 'es' : 'en';

const translationBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: async (language: string, _namespace: string, callback: ReadCallback) => {
    try {
      const normalizedLanguage = normalizeLanguage(language);
      const translations = normalizedLanguage === 'es'
        ? await import('./locales/es/translation.json')
        : await import('./locales/en/translation.json');
      callback(null, translations.default);
    } catch (error) {
      callback(error instanceof Error ? error : new Error('Unable to load translations'), null);
    }
  },
};

export const initializeI18n = async () => {
  if (i18n.isInitialized) return i18n;

  await i18n
    .use(translationBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: supportedLanguages,
      nonExplicitSupportedLngs: true,
      fallbackLng: 'en',
      defaultNS: 'translation',
      ns: ['translation'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });

  return i18n;
};

export default i18n;
