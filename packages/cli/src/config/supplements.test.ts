import { describe, it, expect } from 'vitest';
import { getSupplementInfo } from './supplements.js';

describe('supplements config', () => {
  it('returns supplement info for a known faction/source pair', () => {
    const info = getSupplementInfo('SM', '000000021');
    expect(info).toEqual({
      slug: 'blood-angels',
      name: 'Blood Angels'
    });
  });

  it('returns undefined when source is missing', () => {
    expect(getSupplementInfo('SM', undefined)).toBeUndefined();
  });

  it('returns undefined when faction has no supplements configured', () => {
    expect(getSupplementInfo('XYZ', '000000021')).toBeUndefined();
  });

  it('returns undefined for unmapped sources', () => {
    expect(getSupplementInfo('SM', 'unknown')).toBeUndefined();
  });
});
