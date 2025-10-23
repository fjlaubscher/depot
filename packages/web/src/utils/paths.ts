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

const normalizeDataSuffix = (value: string): string => value.replace(/^\/+/, '');

export const getDataPath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) {
    return DATA_ROOT;
  }

  const normalized = trimmed.replace(/\\/g, '/');
  const dataSegmentIndex = normalized.indexOf(DATA_ROOT);
  if (dataSegmentIndex !== -1) {
    const suffix = normalized.slice(dataSegmentIndex + DATA_ROOT.length);
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

const readConfiguredBasePath = (): string => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_APP_BASE_PATH
      : undefined;

  const fromProcess = typeof process !== 'undefined' ? process.env?.VITE_APP_BASE_PATH : undefined;

  return normalizeBasePath(fromImportMeta ?? fromProcess ?? '');
};

/**
 * Returns the application base path without a trailing slash.
 */
export const getAppBasePath = (basePath?: string): string =>
  normalizeBasePath(basePath ?? readConfiguredBasePath());

/**
 * Returns the BrowserRouter base path (undefined in development for defaults).
 */
export const getRouterBasePath = (basePath?: string): string | undefined => {
  const normalizedBasePath = getAppBasePath(basePath);
  return normalizedBasePath || undefined;
};

/**
 * Returns the Vite base path, ensuring a trailing slash when the app is bundled.
 */
export const getViteBasePath = (basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  return normalizedBasePath ? `${normalizedBasePath}/` : '/';
};

/**
 * Constructs a data URL with the correct base path.
 */
export const getDataUrl = (path: string, basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  const normalizedPath = getDataPath(path);

  return `${normalizedBasePath}${normalizedPath}`;
};
