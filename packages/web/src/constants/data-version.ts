const FALLBACK_DATA_VERSION = '2025-11-21';

const getEnvDataVersion = (): string | undefined => {
  try {
    // Vite in both browser/runtime and vitest exposes import.meta.env
    return import.meta.env?.VITE_DATA_VERSION as string | undefined;
  } catch {
    return undefined;
  }
};

export const DATA_VERSION = getEnvDataVersion() ?? FALLBACK_DATA_VERSION;
