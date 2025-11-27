import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TAB_ACTIVE_CLASS,
  DEFAULT_TAB_INACTIVE_CLASS,
  getSupplementStyles,
  supplementColorKeys
} from './supplement-styles';

describe('getSupplementStyles', () => {
  it('returns mapped styles for known supplements', () => {
    const styles = getSupplementStyles('blood-angels');

    expect(styles.tagClass).toContain('bg-red-100');
    expect(styles.tabActiveClass).toContain('bg-red-600');
    expect(styles.tabInactiveClass).toContain('border-red-200');
  });

  it('is case-insensitive and returns default styles for unknown keys', () => {
    const styles = getSupplementStyles('UNKNOWN');
    expect(styles.tagClass).toBe('');
    expect(styles.tabActiveClass).toBe(DEFAULT_TAB_ACTIVE_CLASS);
    expect(styles.tabInactiveClass).toBe(DEFAULT_TAB_INACTIVE_CLASS);
  });

  it('exposes a stable list of mapped keys', () => {
    expect(supplementColorKeys).toEqual(
      expect.arrayContaining([
        'blood-angels',
        'dark-angels',
        'space-wolves',
        'black-templars',
        'deathwatch',
        'ultramarines-legends',
        'imperial-agents-legends'
      ])
    );
  });
});
