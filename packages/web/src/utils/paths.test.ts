import { afterEach, describe, expect, it } from 'vitest';

import {
  getAppBasePath,
  getDataPath,
  getDataUrl,
  getDatasheetPath,
  getFactionManifestPath,
  getRouterBasePath,
  getViteBasePath
} from './paths';

const setBasePath = (value?: string) => {
  if (typeof value === 'string') {
    if (!import.meta.env) {
      (import.meta as { env: Record<string, string> }).env = {} as Record<string, string>;
    }

    process.env.VITE_APP_BASE_PATH = value;
    (import.meta.env as Record<string, string>).VITE_APP_BASE_PATH = value;
    return;
  }

  delete process.env.VITE_APP_BASE_PATH;
  if (import.meta.env) {
    delete (import.meta.env as Record<string, string | undefined>).VITE_APP_BASE_PATH;
  }
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
    expect(getDataPath('index.json')).toBe('/data/index.json');
    expect(getDataPath('/data/index.json')).toBe('/data/index.json');
    expect(getRouterBasePath()).toBeUndefined();
    expect(getViteBasePath()).toBe('/');
    expect(getDataUrl('units.json')).toBe('/data/units.json');
  });

  it('normalises the configured base path', () => {
    setBasePath('/depot/');

    expect(getAppBasePath()).toBe('/depot');
    expect(getDataPath('/depot/data/units.json')).toBe('/data/units.json');
    expect(getRouterBasePath()).toBe('/depot');
    expect(getViteBasePath()).toBe('/depot/');
    expect(getDataUrl('units.json')).toBe('/depot/data/units.json');
  });

  it('handles leading slashes when building data URLs', () => {
    setBasePath('/depot/');

    expect(getDataPath('//units.json')).toBe('/data/units.json');
    expect(getDataUrl('/data/units.json')).toBe('/depot/data/units.json');
    expect(getDataUrl('//units.json')).toBe('/depot/data/units.json');
  });

  it('builds nested faction and datasheet paths', () => {
    expect(getFactionManifestPath('space-marines')).toBe(
      '/data/factions/space-marines/faction.json'
    );
    expect(getDatasheetPath('space-marines', '123')).toBe(
      '/data/factions/space-marines/datasheets/123.json'
    );
  });
});
