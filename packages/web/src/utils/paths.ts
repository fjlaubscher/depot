const readConfiguredBasePath = (): string => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_APP_BASE_PATH
      : undefined;

  const fromProcess = typeof process !== 'undefined' ? process.env?.VITE_APP_BASE_PATH : undefined;

  return fromImportMeta ?? fromProcess ?? '';
};

/** `/depot/` → `/depot`, empty/undefined → `` (falls back to the configured base path). */
export const getAppBasePath = (basePath?: string): string => {
  const trimmed = (basePath ?? readConfiguredBasePath()).trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
};

export const getRouterBasePath = (basePath?: string): string | undefined =>
  getAppBasePath(basePath) || undefined;

export const getViteBasePath = (basePath?: string): string => `${getAppBasePath(basePath)}/`;

export const getDataPath = (path: string): string => `/data/${path.replace(/^\/*(data\/)?/, '')}`;

export const getDataUrl = (path: string, basePath?: string): string =>
  `${getAppBasePath(basePath)}${getDataPath(path)}`;

export const getImageUrl = (path: string, basePath?: string): string =>
  `${getAppBasePath(basePath)}/images/${path}`;

export const getFactionManifestPath = (slug: string): string =>
  getDataPath(`factions/${slug}/faction.json`);

export const getDatasheetPath = (factionSlug: string, datasheetId: string): string =>
  getDataPath(`factions/${factionSlug}/datasheets/${datasheetId}.json`);

export const buildAbsoluteUrl = (path: string = '/'): string => {
  const normalizedBasePath = getAppBasePath();
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedPath = sanitizedPath === '/' ? '' : sanitizedPath;
  const relativePath = `${normalizedBasePath}${normalizedPath}` || '/';
  const origin =
    typeof window !== 'undefined' && typeof window.location !== 'undefined'
      ? window.location.origin
      : '';

  return origin ? `${origin}${relativePath}` : relativePath;
};
