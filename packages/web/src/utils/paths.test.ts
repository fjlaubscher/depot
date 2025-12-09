import { afterEach, describe, expect, it } from 'vitest';
import { buildAbsoluteUrl } from './paths';

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
