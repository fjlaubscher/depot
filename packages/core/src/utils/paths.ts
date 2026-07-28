export const normalizeBasePath = (value?: string | null): string => {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
};

export const getDataPath = (path: string): string => `/data/${path.replace(/^\/*(data\/)?/, '')}`;

export const getRouterBasePath = (basePath?: string): string | undefined =>
  normalizeBasePath(basePath) || undefined;

export const getViteBasePath = (basePath?: string): string => `${normalizeBasePath(basePath)}/`;

export const getDataUrl = (path: string, basePath?: string): string =>
  `${normalizeBasePath(basePath)}${getDataPath(path)}`;

export const getImageUrl = (path: string, basePath?: string): string =>
  `${normalizeBasePath(basePath)}/images/${path}`;

export const getFactionManifestPath = (slug: string): string =>
  getDataPath(`factions/${slug}/faction.json`);

export const getDatasheetPath = (factionSlug: string, datasheetId: string): string =>
  getDataPath(`factions/${factionSlug}/datasheets/${datasheetId}.json`);
