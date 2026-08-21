import { describe, it, expect } from 'vitest';
import { supplements } from './supplements.js';

describe('supplements config', () => {
  it('returns supplement info for a known source', () => {
    expect(supplements['000000021']).toEqual({
      slug: 'blood-angels',
      name: 'Blood Angels'
    });
  });

  it('returns undefined for unmapped sources', () => {
    expect(supplements['unknown']).toBeUndefined();
  });

  it('does not map removed 10th-edition legend source IDs', () => {
    expect(supplements['000000372']).toBeUndefined();
    expect(supplements['000000287']).toBeUndefined();
  });
});
