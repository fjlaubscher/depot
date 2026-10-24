import { describe, it, expect } from 'vitest';

import { byUpdatedAtDesc, relativeTime, takeRecent } from './recent';
import i18n from '@/i18n';

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
  const en = i18n.getFixedT('en', 'home');
  const fr = i18n.getFixedT('fr', 'home');

  it('formats the largest whole unit', () => {
    expect(relativeTime('2026-08-21T11:59:30.000Z', en, now)).toBe('EDITED JUST NOW');
    expect(relativeTime('2026-08-21T11:30:00.000Z', en, now)).toBe('EDITED 30M AGO');
    expect(relativeTime('2026-08-21T10:00:00.000Z', en, now)).toBe('EDITED 2H AGO');
    expect(relativeTime('2026-08-18T12:00:00.000Z', en, now)).toBe('EDITED 3D AGO');
  });

  it('handles missing and future timestamps', () => {
    expect(relativeTime(null, en, now)).toBe('EDITED NEVER');
    expect(relativeTime('2026-09-01T00:00:00.000Z', en, now)).toBe('EDITED JUST NOW');
    expect(relativeTime(null, fr, now)).toBe('JAMAIS MODIFIÉE');
    expect(relativeTime('2026-09-01T00:00:00.000Z', fr, now)).toBe('MODIFIÉE À L’INSTANT');
  });

  it.each([
    [30, 'MODIFIÉE À L’INSTANT'],
    [60, 'MODIFIÉE IL Y A 1 MIN'],
    [120, 'MODIFIÉE IL Y A 2 MIN'],
    [3600, 'MODIFIÉE IL Y A 1 H'],
    [7200, 'MODIFIÉE IL Y A 2 H'],
    [86400, 'MODIFIÉE IL Y A 1 J'],
    [172800, 'MODIFIÉE IL Y A 2 J']
  ])('keeps compact French dates for %i seconds', (seconds, expected) => {
    expect(relativeTime(new Date(now - seconds * 1000).toISOString(), fr, now)).toBe(expected);
  });
});
