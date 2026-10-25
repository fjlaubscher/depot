import 'i18next';
import type common from './locales/en/common.json';
import type home from './locales/en/home.json';
import type settings from './locales/en/settings.json';
import type catalog from './locales/en/catalog.json';
import type rosters from './locales/en/rosters.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      home: typeof home;
      settings: typeof settings;
      catalog: typeof catalog;
      rosters: typeof rosters;
    };
    strictKeyChecks: true;
  }
}
