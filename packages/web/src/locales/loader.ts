import type { BackendModule, ResourceKey } from 'i18next';

const urls = import.meta.glob<string>('./*/*.json', {
  query: '?url&no-inline',
  import: 'default',
  eager: true
});
const downloads = new Map<string, Promise<ResourceKey>>();

export const loadTranslation = async (
  language: string,
  namespace: string
): Promise<ResourceKey> => {
  const url = urls[`./${language}/${namespace}.json`];
  if (!url) throw new Error(`Unknown translation: ${language}/${namespace}`);

  let download = downloads.get(url);
  if (!download) {
    download = (async () => {
      let cache: Cache | undefined;
      let cached: Response | undefined;
      try {
        cache = await globalThis.caches?.open('depot-translations');
        cached = await cache?.match(url);
      } catch {
        // Cache storage can be disabled; translations must still work online.
      }
      const response = cached ?? (await fetch(url));
      if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
      const data: unknown = await response.clone().json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(`Invalid translation: ${language}/${namespace}`);
      }
      if (cache && !cached) {
        try {
          await cache.put(url, response);
        } catch {
          // A full cache must not prevent displaying a downloaded translation.
        }
      }
      return data as ResourceKey;
    })();
    downloads.set(url, download);
    download.catch(() => downloads.delete(url));
  }
  return download;
};

export const preloadTranslations = async (language: string): Promise<void> => {
  const useful = new Set([language, 'en']);
  await Promise.allSettled(
    Object.keys(urls).flatMap((path) => {
      const [, candidate, file] = path.split('/');
      return useful.has(candidate) ? [loadTranslation(candidate, file.replace('.json', ''))] : [];
    })
  );
};

export const translationBackend: BackendModule = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    void loadTranslation(language, namespace).then(
      (data) => callback(null, data),
      (error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), false)
    );
  }
};
