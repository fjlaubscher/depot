const PRODUCTION_BASE_PATH = '/depot';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string): string => {
  if (!value.length) {
    return '';
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const withSingleLeadingSlash = (value: string): string => `/${value.replace(/^\/+/, '')}`;

/**
 * Returns the application base path without a trailing slash.
 */
export const getAppBasePath = (): string => {
  if (process.env.NODE_ENV !== 'production') {
    return '';
  }

  return stripTrailingSlash(ensureLeadingSlash(PRODUCTION_BASE_PATH));
};

/**
 * Returns the BrowserRouter base path (undefined in development for defaults).
 */
export const getRouterBasePath = (): string | undefined => {
  const basePath = getAppBasePath();
  return basePath || undefined;
};

/**
 * Returns the Vite base path, ensuring a trailing slash when the app is bundled.
 */
export const getViteBasePath = (): string => {
  const basePath = getAppBasePath();
  return basePath ? `${basePath}/` : '/';
};

/**
 * Constructs a data URL with the correct base path.
 */
export const getDataUrl = (path: string): string => {
  const basePath = getAppBasePath();
  const normalizedPath = path.startsWith('/')
    ? withSingleLeadingSlash(path)
    : `/data/${path.replace(/^\/+/, '')}`;

  return `${basePath}${normalizedPath}`;
};
