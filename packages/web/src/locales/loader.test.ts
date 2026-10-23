import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createInstance } from 'i18next';

const english = { navigation: { home: 'Home' } };
const french = { navigation: { home: 'Accueil' } };

describe('translation loading', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => Response.json(url.includes('/fr/') ? french : english))
    );
    vi.stubGlobal('caches', undefined);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('loads the requested namespace and its English fallback', async () => {
    const { translationBackend } = await import('./loader');
    const instance = createInstance().use(translationBackend);
    await instance.init({ lng: 'fr', fallbackLng: 'en', ns: ['common'], defaultNS: 'common' });

    expect(instance.t('navigation.home')).toBe('Accueil');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls.every(([url]) => String(url).includes('/common.json'))).toBe(
      true
    );
  });

  it('falls back to English when the French download fails', async () => {
    vi.mocked(fetch).mockImplementation(async (url) =>
      String(url).includes('/fr/') ? new Response('', { status: 503 }) : Response.json(english)
    );
    const { translationBackend } = await import('./loader');
    const instance = createInstance().use(translationBackend);
    await instance.init({ lng: 'fr', fallbackLng: 'en', ns: ['common'], defaultNS: 'common' });

    expect(instance.t('navigation.home')).toBe('Home');
  });

  it('caches successful downloads for offline reuse', async () => {
    const entries = new Map<string, Response>();
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (url: string) => entries.get(url)?.clone(),
        put: async (url: string, response: Response) => {
          entries.set(url, response.clone());
        }
      })
    });
    const { loadTranslation } = await import('./loader');
    expect(await loadTranslation('fr', 'common')).toEqual(french);
    vi.mocked(fetch).mockRejectedValue(new TypeError('offline'));
    vi.resetModules();
    const reloaded = await import('./loader');

    expect(await reloaded.loadTranslation('fr', 'common')).toEqual(french);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not cache failed or malformed responses and permits a retry', async () => {
    const { loadTranslation } = await import('./loader');
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 404 }));
    await expect(loadTranslation('fr', 'common')).rejects.toThrow('404');
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(null));
    await expect(loadTranslation('fr', 'common')).rejects.toThrow();
    expect(await loadTranslation('fr', 'common')).toEqual(french);
  });

  it('keeps downloads working when cache storage is unavailable', async () => {
    vi.stubGlobal('caches', {
      open: async () => {
        throw new Error('storage disabled');
      }
    });
    const { loadTranslation } = await import('./loader');
    expect(await loadTranslation('en', 'common')).toEqual(english);
  });

  it('still downloads translations if a cache read fails', async () => {
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async () => {
          throw new Error('cache read failed');
        },
        put: vi.fn()
      })
    });
    const { loadTranslation } = await import('./loader');
    expect(await loadTranslation('en', 'common')).toEqual(english);
  });

  it('prepares only English when English is the current language', async () => {
    const { preloadTranslations } = await import('./loader');
    await preloadTranslations('en');
    const requested = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(requested).toHaveLength(3);
    expect(requested.every((url) => url.includes('/en/'))).toBe(true);
    expect(requested.some((url) => url.includes('/settings.json'))).toBe(true);
  });

  it('prepares the current language and English, and ignores unsupported languages', async () => {
    const { preloadTranslations, loadTranslation } = await import('./loader');
    await preloadTranslations('fr');
    const requested = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(requested).toHaveLength(6);
    expect(requested.every((url) => /\/(fr|en)\//.test(url))).toBe(true);
    await expect(loadTranslation('de', 'common')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(6);
  });
});
