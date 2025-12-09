import {
  getAppBasePath as getAppBasePathCore,
  getRouterBasePath as getRouterBasePathCore,
  getViteBasePath as getViteBasePathCore,
  getDataPath,
  getImagePath,
  getDataUrl as getDataUrlCore,
  getImageUrl as getImageUrlCore,
  getFactionManifestPath,
  getDatasheetPath
} from '@depot/core/utils/paths';

const readConfiguredBasePath = (): string => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_APP_BASE_PATH
      : undefined;

  const fromProcess = typeof process !== 'undefined' ? process.env?.VITE_APP_BASE_PATH : undefined;

  return fromImportMeta ?? fromProcess ?? '';
};

export const getAppBasePath = (basePath?: string): string =>
  getAppBasePathCore(basePath ?? readConfiguredBasePath());

export const getRouterBasePath = (basePath?: string): string | undefined =>
  getRouterBasePathCore(basePath ?? readConfiguredBasePath());

export const getViteBasePath = (basePath?: string): string =>
  getViteBasePathCore(basePath ?? readConfiguredBasePath());

export const getDataUrl = (path: string, basePath?: string): string =>
  getDataUrlCore(path, basePath ?? readConfiguredBasePath());

export const getImageUrl = (path: string, basePath?: string): string =>
  getImageUrlCore(path, basePath ?? readConfiguredBasePath());

export { getDataPath, getImagePath, getFactionManifestPath, getDatasheetPath };

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
