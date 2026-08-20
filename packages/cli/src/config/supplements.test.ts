import { describe, it, expect } from 'vitest';
import { getSupplementInfo } from './supplements.js';

describe('supplements config', () => {
  it('returns supplement info for a known source', () => {
    expect(getSupplementInfo('000000021')).toEqual({
      slug: 'blood-angels',
      name: 'Blood Angels'
    });
  });

  it('returns undefined for unmapped sources', () => {
    expect(getSupplementInfo('unknown')).toBeUndefined();
  });

  it('does not map removed 10th-edition legend source IDs', () => {
    expect(getSupplementInfo('000000372')).toBeUndefined();
    expect(getSupplementInfo('000000287')).toBeUndefined();
  });
});
