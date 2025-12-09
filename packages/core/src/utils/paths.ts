const normalizeBasePath = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return '';
  }

  const withoutTrailingSlashes = trimmed.replace(/\/+$/, '');
  const withoutLeadingSlashes = withoutTrailingSlashes.replace(/^\/+/, '');

  return withoutLeadingSlashes ? `/${withoutLeadingSlashes}` : '';
};

const DATA_ROOT = '/data';
const IMAGE_ROOT = '/images';

const normalizeDataSuffix = (value: string): string => value.replace(/^\/+/, '');

export const getDataPath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) {
    return DATA_ROOT;
  }

  const normalized = trimmed.replace(/\\/g, '/');
  const normalizedLower = normalized.toLowerCase();

  if (normalizedLower === DATA_ROOT || normalizedLower.startsWith(`${DATA_ROOT}/`)) {
    const suffix = normalized.slice(DATA_ROOT.length);
    const sanitizedSuffix = normalizeDataSuffix(suffix);
    return sanitizedSuffix ? `${DATA_ROOT}/${sanitizedSuffix}` : DATA_ROOT;
  }

  const dataIndex = normalizedLower.indexOf('/data/');
  if (dataIndex > 0) {
    const suffix = normalized.slice(dataIndex + DATA_ROOT.length);
    const sanitizedSuffix = normalizeDataSuffix(suffix);
    return sanitizedSuffix ? `${DATA_ROOT}/${sanitizedSuffix}` : DATA_ROOT;
  }

  let remainder = normalizeDataSuffix(normalized);

  if (remainder.toLowerCase().startsWith('data/')) {
    remainder = remainder.slice('data/'.length);
  } else if (remainder.toLowerCase() === 'data') {
    remainder = '';
  }

  const sanitizedRemainder = normalizeDataSuffix(remainder);
  return sanitizedRemainder ? `${DATA_ROOT}/${sanitizedRemainder}` : DATA_ROOT;
};

export const getImagePath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) {
    return IMAGE_ROOT;
  }

  const normalizedPath = trimmed.replace(/\\/g, '/');
  return `${IMAGE_ROOT}/${normalizedPath}`;
};

export const getAppBasePath = (basePath?: string): string => normalizeBasePath(basePath ?? '');

export const getRouterBasePath = (basePath?: string): string | undefined => {
  const normalizedBasePath = getAppBasePath(basePath);
  return normalizedBasePath || undefined;
};

export const getViteBasePath = (basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  return normalizedBasePath ? `${normalizedBasePath}/` : '/';
};

export const getDataUrl = (path: string, basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  const normalizedPath = getDataPath(path);

  return `${normalizedBasePath}${normalizedPath}`;
};

export const getImageUrl = (path: string, basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  const normalizedPath = getImagePath(path);

  return `${normalizedBasePath}${normalizedPath}`;
};

export const getFactionManifestPath = (slug: string): string =>
  getDataPath(`factions/${slug}/faction.json`);

export const getDatasheetPath = (factionSlug: string, datasheetId: string): string =>
  getDataPath(`factions/${factionSlug}/datasheets/${datasheetId}.json`);
