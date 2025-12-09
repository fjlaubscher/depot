import { describe, expect, it } from 'vitest';
import {
  getAppBasePath,
  getDataPath,
  getDataUrl,
  getDatasheetPath,
  getFactionManifestPath,
  getRouterBasePath,
  getViteBasePath
} from './paths.js';

describe('paths helpers', () => {
  it('returns defaults when no base path is configured', () => {
    expect(getAppBasePath()).toBe('');
    expect(getDataPath('index.json')).toBe('/data/index.json');
    expect(getDataPath('/data/index.json')).toBe('/data/index.json');
    expect(getRouterBasePath()).toBeUndefined();
    expect(getViteBasePath()).toBe('/');
    expect(getDataUrl('units.json')).toBe('/data/units.json');
  });

  it('normalizes the provided base path', () => {
    expect(getAppBasePath('/depot/')).toBe('/depot');
    expect(getRouterBasePath('/depot/')).toBe('/depot');
    expect(getViteBasePath('/depot/')).toBe('/depot/');
    expect(getDataUrl('units.json', '/depot/')).toBe('/depot/data/units.json');
  });

  it('handles leading slashes when building data URLs', () => {
    expect(getDataPath('//units.json')).toBe('/data/units.json');
    expect(getDataUrl('/data/units.json', '/depot/')).toBe('/depot/data/units.json');
    expect(getDataUrl('//units.json', '/depot/')).toBe('/depot/data/units.json');
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
