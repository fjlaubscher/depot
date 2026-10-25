import { describe, expect, it } from 'vitest';
import i18n, { detectBrowserLanguage } from './i18n';

describe('detectBrowserLanguage', () => {
  it.each([
    [['de', 'fr-CA', 'en'], 'fr'],
    [['en-GB', 'fr'], 'en'],
    [['fr-FR'], 'fr'],
    [['FR-ca'], 'fr'],
    [['ja'], 'en'],
    [[], 'en'],
    [['french', 'francais'], 'en'],
    [['english', 'fr'], 'fr']
  ])('detects %j as %s', (languages, expected) => {
    expect(detectBrowserLanguage(languages)).toBe(expected);
  });
});

describe('i18n', () => {
  it('loads roster translations and falls back to English for missing French keys', () => {
    expect(i18n.getFixedT('fr', 'rosters')('copyName', { name: 'Ma liste' })).toBe(
      'Ma liste (Copie)'
    );
    const isolated = i18n.cloneInstance({ lng: 'fr', forkResourceStore: true });
    isolated.removeResourceBundle('fr', 'rosters');
    expect(isolated.t('copyName', { ns: 'rosters', name: 'Ma liste' })).toBe('Ma liste (Copy)');
  });
  it('uses a separate common namespace for shared interface text', () => {
    expect(i18n.options.defaultNS).toBe('common');
  });
  it('uses English by default and keeps domains separate', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
    expect(i18n.getFixedT('en', 'home')('bookmarks')).toBe('Bookmarks');
    expect(i18n.getFixedT('fr', 'home')('bookmarks')).toBe('Favoris');
  });

  it.each([
    ['en', 1, '1 bookmark'],
    ['en', 2, '2 bookmarks'],
    ['fr', 1, '1 favori'],
    ['fr', 2, '2 favoris'],
    ['fr', 0, '0 favori'],
    ['fr', 42, '42 favoris'],
    ['en', 1234, '1,234 bookmarks'],
    ['fr', 1234, '1 234 favoris']
  ])('interpolates and pluralizes in %s for count %i', (language, count, expected) => {
    expect(i18n.getFixedT(language, 'home')('bookmarkCount', { count })).toBe(expected);
  });

  it('falls back to English when a French key is missing', () => {
    const isolated = i18n.cloneInstance({ lng: 'fr', forkResourceStore: true });
    isolated.removeResourceBundle('fr', 'home');
    isolated.addResourceBundle('fr', 'home', { bookmarks: 'Favoris' });

    expect(isolated.t('bookmarks', { ns: 'home' })).toBe('Favoris');
    expect(isolated.t('bookmarkCount', { ns: 'home', count: 2 })).toBe('2 bookmarks');
    expect(i18n.getFixedT('fr', 'home')('bookmarkCount', { count: 2 })).toBe('2 favoris');
  });

  it('rejects unknown keys at compile time, including with a default value', () => {
    // @ts-expect-error Unknown keys must not compile.
    i18n.t('unknown', { ns: 'home' });
    // @ts-expect-error A default value must not bypass key checking.
    i18n.t('unknown', { ns: 'home', defaultValue: 'Unknown' });
  });
});
