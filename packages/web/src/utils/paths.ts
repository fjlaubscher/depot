/**
 * Gets the base path for the application based on the environment
 */
const getBasePath = (): string => {
  return process.env.NODE_ENV === 'production' ? '/depot' : '';
};

/**
 * Constructs a data URL with the correct base path
 */
export const getDataUrl = (path: string): string => {
  const basePath = getBasePath();
  if (path.startsWith('/')) {
    return `${basePath}${path}`;
  }

  return `${basePath}/data/${path}`;
};
