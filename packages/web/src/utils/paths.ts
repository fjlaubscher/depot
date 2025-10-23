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

const withSingleLeadingSlash = (value: string): string => `/${value.replace(/^\/+/, '')}`;

/**
 * Constructs a data URL with the correct base path.
 */
export const getDataUrl = (path: string, basePath?: string): string => {
  const normalizedBasePath = getAppBasePath(basePath);
  const normalizedPath = path.startsWith('/')
    ? withSingleLeadingSlash(path)
    : `/data/${path.replace(/^\/+/, '')}`;

  return `${normalizedBasePath}${normalizedPath}`;
};
