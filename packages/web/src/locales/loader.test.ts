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
    expect(await loadTranslation('fr', 'rosters')).toEqual(french);
    vi.mocked(fetch).mockRejectedValue(new TypeError('offline'));
    vi.resetModules();
    const reloaded = await import('./loader');

    expect(await reloaded.loadTranslation('fr', 'rosters')).toEqual(french);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('reloads French rosters offline and uses cached English for a missing French key', async () => {
    const entries = new Map<string, Response>();
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (url: string) => entries.get(url)?.clone(),
        put: async (url: string, response: Response) => {
          entries.set(url, response.clone());
        }
      })
    });
    vi.mocked(fetch).mockImplementation(async (url) =>
      Response.json(
        String(url).includes('/fr/')
          ? { copyName: '{{name}} (Copie)' }
          : { copyName: '{{name}} (Copy)', pages: { overview: 'Roster Overview' } }
      )
    );
    const { loadTranslation } = await import('./loader');
    await Promise.all([loadTranslation('fr', 'rosters'), loadTranslation('en', 'rosters')]);
    vi.mocked(fetch).mockRejectedValue(new TypeError('offline'));
    vi.resetModules();
    const { translationBackend } = await import('./loader');
    const instance = createInstance().use(translationBackend);
    await instance.init({ lng: 'fr', fallbackLng: 'en', ns: ['rosters'], defaultNS: 'rosters' });
    expect(instance.t('copyName', { ns: 'rosters', name: 'Ma liste' })).toBe('Ma liste (Copie)');
    expect(instance.t('pages.overview', { ns: 'rosters' })).toBe('Roster Overview');
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('revalidates cached translations and replaces changed content once per page load', async () => {
    let cached = Response.json({ hero: { title: 'Ancien titre' } });
    const updated = { hero: { title: 'Titre mis à jour' } };
    const put = vi.fn(async (_url: string, response: Response) => {
      cached = response.clone();
    });
    vi.stubGlobal('caches', {
      open: async () => ({ match: async () => cached.clone(), put })
    });
    vi.mocked(fetch).mockResolvedValue(Response.json(updated));
    const { loadTranslation } = await import('./loader');

    const results = await Promise.all([
      loadTranslation('fr', 'home'),
      loadTranslation('fr', 'home')
    ]);

    expect(results).toEqual([updated, updated]);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/fr/home.json'), {
      cache: 'no-cache'
    });
    expect(put).toHaveBeenCalledOnce();
    expect(await cached.json()).toEqual(updated);
  });

  it('keeps cached translations when revalidation returns a server error', async () => {
    const put = vi.fn();
    vi.stubGlobal('caches', {
      open: async () => ({ match: async () => Response.json(french), put })
    });
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 503 }));
    const { loadTranslation } = await import('./loader');

    expect(await loadTranslation('fr', 'common')).toEqual(french);
    expect(fetch).toHaveBeenCalledOnce();
    expect(put).not.toHaveBeenCalled();
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
    expect(requested).toHaveLength(5);
    expect(requested.some((url) => url.includes('/rosters.json'))).toBe(true);
    expect(requested.every((url) => url.includes('/en/'))).toBe(true);
    expect(requested.some((url) => url.includes('/settings.json'))).toBe(true);
  });

  it('prepares the current language and English, and ignores unsupported languages', async () => {
    const { preloadTranslations, loadTranslation } = await import('./loader');
    await preloadTranslations('fr');
    const requested = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(requested).toHaveLength(10);
    expect(requested.every((url) => /\/(fr|en)\//.test(url))).toBe(true);
    await expect(loadTranslation('de', 'common')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(10);
  });
});
