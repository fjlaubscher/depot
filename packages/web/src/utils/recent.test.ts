import { describe, it, expect } from 'vitest';

import { byUpdatedAtDesc, takeRecent } from './recent';

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
