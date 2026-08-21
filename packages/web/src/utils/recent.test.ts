import { describe, it, expect } from 'vitest';

import { byUpdatedAtDesc, relativeTime, takeRecent } from './recent';

describe('recent sorting', () => {
  it('sorts by updatedAt descending and sinks missing timestamps', () => {
    const items = [
      { id: 'a', updatedAt: '2024-01-01T00:00:00.000Z' },
      { id: 'b', updatedAt: '2025-06-01T00:00:00.000Z' },
      { id: 'c' },
      { id: 'd', updatedAt: '2025-01-01T00:00:00.000Z' }
    ];

    const sorted = [...items].sort(byUpdatedAtDesc);
    expect(sorted.map((item) => item.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('takes a limited recent slice', () => {
    const items = [
      { id: '1', updatedAt: '2020-01-01T00:00:00.000Z' },
      { id: '2', updatedAt: '2024-01-01T00:00:00.000Z' },
      { id: '3', updatedAt: '2023-01-01T00:00:00.000Z' }
    ];

    expect(takeRecent(items, 2).map((item) => item.id)).toEqual(['2', '3']);
  });
});

describe('relativeTime', () => {
  const now = Date.parse('2026-08-21T12:00:00.000Z');

  it('formats the largest whole unit', () => {
    expect(relativeTime('2026-08-21T11:59:30.000Z', now)).toBe('JUST NOW');
    expect(relativeTime('2026-08-21T11:30:00.000Z', now)).toBe('30M AGO');
    expect(relativeTime('2026-08-21T10:00:00.000Z', now)).toBe('2H AGO');
    expect(relativeTime('2026-08-18T12:00:00.000Z', now)).toBe('3D AGO');
  });

  it('handles missing and future timestamps', () => {
    expect(relativeTime(null, now)).toBe('NEVER');
    expect(relativeTime('2026-09-01T00:00:00.000Z', now)).toBe('JUST NOW');
  });
});
