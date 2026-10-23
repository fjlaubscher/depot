import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import fr from './locales/fr';

export const detectBrowserLanguage = (languages: readonly string[]): 'fr' | 'en' => {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    if (base === 'fr' || base === 'en') return base;
  }
  return 'en';
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr }
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'fr'],
  defaultNS: 'translation',
  initAsync: false,
  interpolation: { escapeValue: false }
});

export default i18n;
