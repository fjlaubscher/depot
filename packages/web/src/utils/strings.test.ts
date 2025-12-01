import { describe, it, expect } from 'vitest';

import { safeSlug } from './strings';

describe('safeSlug', () => {
  it('returns fallback for empty input', () => {
    expect(safeSlug('')).toBe('item');
  });

  it('returns fallback for only special characters', () => {
    expect(safeSlug('!!!')).toBe('item');
    expect(safeSlug('__')).toBe('item');
  });

  it('normalizes consecutive specials to single underscore', () => {
    expect(safeSlug('Hello---World')).toBe('hello_world');
  });

  it('trims leading and trailing underscores', () => {
    expect(safeSlug('_hello_world_')).toBe('hello_world');
  });

  it('lowercases and keeps alphanumerics', () => {
    expect(safeSlug('My Roster 123')).toBe('my_roster_123');
  });
});
