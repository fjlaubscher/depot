import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translationBackend } from './locales/loader';

export const detectBrowserLanguage = (languages: readonly string[]): 'fr' | 'en' => {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    if (base === 'fr' || base === 'en') return base;
  }
  return 'en';
};

void i18n
  .use(translationBackend)
  .use(initReactI18next)
  .init({
    resources: {},
    partialBundledLanguages: true,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    ns: [],
    defaultNS: 'common',
    initAsync: false,
    interpolation: { escapeValue: false }
  });

export default i18n;
