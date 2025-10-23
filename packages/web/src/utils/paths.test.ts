import { afterEach, describe, expect, it } from 'vitest';

import { getAppBasePath, getDataUrl, getRouterBasePath, getViteBasePath } from './paths';

const setBasePath = (value?: string) => {
  if (typeof value === 'string') {
    process.env.VITE_APP_BASE_PATH = value;
    (import.meta.env as Record<string, string>).VITE_APP_BASE_PATH = value;
    return;
  }

  delete process.env.VITE_APP_BASE_PATH;
  delete (import.meta.env as Record<string, string | undefined>).VITE_APP_BASE_PATH;
};

describe('paths helpers', () => {
  const originalProcessBasePath = process.env.VITE_APP_BASE_PATH;
  const originalImportMetaBasePath = import.meta.env.VITE_APP_BASE_PATH;

  afterEach(() => {
    setBasePath(undefined);

    if (typeof originalProcessBasePath === 'string') {
      process.env.VITE_APP_BASE_PATH = originalProcessBasePath;
    }

    if (typeof originalImportMetaBasePath === 'string') {
      (import.meta.env as Record<string, string>).VITE_APP_BASE_PATH = originalImportMetaBasePath;
    }
  });

  it('returns defaults when no base path is configured', () => {
    setBasePath();

    expect(getAppBasePath()).toBe('');
    expect(getRouterBasePath()).toBeUndefined();
    expect(getViteBasePath()).toBe('/');
    expect(getDataUrl('units.json')).toBe('/data/units.json');
  });

  it('normalises the configured base path', () => {
    setBasePath('/depot/');

    expect(getAppBasePath()).toBe('/depot');
    expect(getRouterBasePath()).toBe('/depot');
    expect(getViteBasePath()).toBe('/depot/');
    expect(getDataUrl('units.json')).toBe('/depot/data/units.json');
  });

  it('handles leading slashes when building data URLs', () => {
    setBasePath('/depot/');

    expect(getDataUrl('/data/units.json')).toBe('/depot/data/units.json');
    expect(getDataUrl('//units.json')).toBe('/depot/units.json');
  });
});
