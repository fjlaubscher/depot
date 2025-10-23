import { afterEach, describe, expect, it } from 'vitest';

import { getAppBasePath, getDataUrl, getRouterBasePath, getViteBasePath } from './paths';

const setNodeEnv = (value?: string) => {
  if (typeof value === 'string') {
    process.env.NODE_ENV = value;
    return;
  }

  delete process.env.NODE_ENV;
};

describe('paths helpers', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (typeof originalEnv === 'string') {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  it('returns defaults when not in production', () => {
    setNodeEnv('development');

    expect(getAppBasePath()).toBe('');
    expect(getRouterBasePath()).toBeUndefined();
    expect(getViteBasePath()).toBe('/');
    expect(getDataUrl('units.json')).toBe('/data/units.json');
  });

  it('normalises the base path in production', () => {
    setNodeEnv('production');

    expect(getAppBasePath()).toBe('/depot');
    expect(getRouterBasePath()).toBe('/depot');
    expect(getViteBasePath()).toBe('/depot/');
    expect(getDataUrl('units.json')).toBe('/depot/data/units.json');
  });

  it('handles leading slashes when building data URLs', () => {
    setNodeEnv('production');

    expect(getDataUrl('/data/units.json')).toBe('/depot/data/units.json');
    expect(getDataUrl('//units.json')).toBe('/depot/units.json');
  });
});
