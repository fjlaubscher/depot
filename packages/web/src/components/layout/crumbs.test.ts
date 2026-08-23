import { describe, expect, it } from 'vitest';

import { resolveCrumbs } from './crumbs';

describe('resolveCrumbs', () => {
  it('uses explicit crumbs when provided', () => {
    expect(
      resolveCrumbs({
        crumbs: [{ label: 'Armies', to: '/armies' }, { label: 'Collections' }],
        back: { to: '/armies', label: 'Armies' },
        heading: { title: 'Collections' },
        title: 'Collections'
      })
    ).toEqual([{ label: 'Armies', to: '/armies' }, { label: 'Collections' }]);
  });

  it('derives from back and heading', () => {
    expect(
      resolveCrumbs({
        back: { to: '/factions', label: 'Factions' },
        heading: { title: 'Space Marines' },
        title: 'Space Marines - Faction Overview'
      })
    ).toEqual([{ label: 'Factions', to: '/factions' }, { label: 'Space Marines' }]);
  });

  it('falls back to heading, then a short page title', () => {
    expect(resolveCrumbs({ heading: { title: 'Collections' }, title: 'Collections' })).toEqual([
      { label: 'Collections' }
    ]);
    expect(resolveCrumbs({ title: 'Settings' })).toEqual([{ label: 'Settings' }]);
  });

  it('does not put a long document title in the bar', () => {
    expect(resolveCrumbs({ title: 'depot - Offline Warhammer 40,000 Companion' })).toEqual([]);
    expect(resolveCrumbs({ title: 'Gladius Task Force - Detachment' })).toEqual([]);
  });
});
