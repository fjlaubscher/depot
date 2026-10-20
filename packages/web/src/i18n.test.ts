import { describe, expect, it } from 'vitest';
import i18n from './i18n';

describe('i18n', () => {
  it('initializes with both bundled languages and English by default', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
    expect(i18n.getFixedT('en')('home.bookmarks')).toBe('Bookmarks');
    expect(i18n.getFixedT('fr')('home.bookmarks')).toBe('Favoris');
  });

  it.each([
    ['en', 1, '1 bookmark'],
    ['en', 2, '2 bookmarks'],
    ['fr', 1, '1 favori'],
    ['fr', 2, '2 favoris'],
    ['fr', 0, '0 favori'],
    ['fr', 42, '42 favoris']
  ])('interpolates and pluralizes in %s for count %i', (language, count, expected) => {
    expect(i18n.getFixedT(language)('home.bookmarkCount', { count })).toBe(expected);
  });

  it('falls back to English when a French key is missing', () => {
    const isolated = i18n.cloneInstance({ lng: 'fr', forkResourceStore: true });
    isolated.removeResourceBundle('fr', 'translation');
    isolated.addResourceBundle('fr', 'translation', { home: { bookmarks: 'Favoris' } });

    expect(isolated.t('home.bookmarks')).toBe('Favoris');
    expect(isolated.t('home.bookmarkCount', { count: 2 })).toBe('2 bookmarks');
    expect(i18n.getFixedT('fr')('home.bookmarkCount', { count: 2 })).toBe('2 favoris');
  });

  it('rejects unknown keys at compile time, including with a default value', () => {
    // @ts-expect-error Unknown keys must not compile.
    i18n.t('home.unknown');
    // @ts-expect-error A default value must not bypass key checking.
    i18n.t('home.unknown', { defaultValue: 'Unknown' });
  });
});
