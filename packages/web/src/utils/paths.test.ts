import { afterEach, describe, expect, it } from 'vitest';
import {
  buildAbsoluteUrl,
  getAppBasePath,
  getDataPath,
  getDataUrl,
  getDatasheetPath,
  getFactionManifestPath,
  getRouterBasePath,
  getViteBasePath
} from './paths';

const originalWindow = globalThis.window;
const originalProcessBasePath = process.env.VITE_APP_BASE_PATH;
const originalImportMetaBasePath = import.meta.env.VITE_APP_BASE_PATH;

const setBasePath = (value?: string) => {
  if (typeof value === 'string') {
    process.env.VITE_APP_BASE_PATH = value;
    if (!import.meta.env) {
      (import.meta as { env: Record<string, string> }).env = {} as Record<string, string>;
    }
    (import.meta.env as Record<string, string>).VITE_APP_BASE_PATH = value;
    return;
  }

  delete process.env.VITE_APP_BASE_PATH;
  if (import.meta.env) {
    delete (import.meta.env as Record<string, string | undefined>).VITE_APP_BASE_PATH;
  }
};

describe('buildAbsoluteUrl', () => {
  afterEach(() => {
    globalThis.window = originalWindow;
    setBasePath(undefined);

    if (typeof originalProcessBasePath === 'string') {
      process.env.VITE_APP_BASE_PATH = originalProcessBasePath;
    }

    if (typeof originalImportMetaBasePath === 'string') {
      (import.meta.env as Record<string, string>).VITE_APP_BASE_PATH = originalImportMetaBasePath;
    }
  });

  it('builds URLs using window origin', () => {
    globalThis.window = {
      location: {
        origin: 'https://depothub.app'
      }
    } as Window & typeof globalThis;

    expect(buildAbsoluteUrl('/faction')).toBe('https://depothub.app/faction');
  });

  it('respects configured base path', () => {
    setBasePath('/depot');
    globalThis.window = {
      location: {
        origin: 'https://depothub.app'
      }
    } as Window & typeof globalThis;

    expect(buildAbsoluteUrl('/faction')).toBe('https://depothub.app/depot/faction');
  });

  it('returns relative path when window is unavailable', () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    expect(buildAbsoluteUrl('/faction')).toBe('/faction');
  });
});

describe('path helpers', () => {
  it('returns defaults when no base path is configured', () => {
    expect(getAppBasePath('')).toBe('');
    expect(getDataPath('index.json')).toBe('/data/index.json');
    expect(getDataPath('/data/index.json')).toBe('/data/index.json');
    expect(getDataPath('//units.json')).toBe('/data/units.json');
    expect(getRouterBasePath('')).toBeUndefined();
    expect(getViteBasePath('')).toBe('/');
    expect(getDataUrl('units.json', '')).toBe('/data/units.json');
  });

  it('normalizes the provided base path', () => {
    expect(getAppBasePath('/depot/')).toBe('/depot');
    expect(getRouterBasePath('/depot/')).toBe('/depot');
    expect(getViteBasePath('/depot/')).toBe('/depot/');
    expect(getDataUrl('/data/units.json', '/depot/')).toBe('/depot/data/units.json');
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
