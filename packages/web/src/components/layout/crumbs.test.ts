import { describe, expect, it } from 'vitest';

import { resolveAncestors } from './crumbs';

describe('resolveAncestors', () => {
  it('keeps explicit crumbs that have a destination and drops the current page', () => {
    expect(
      resolveAncestors({
        crumbs: [{ label: 'Armies', to: '/armies' }, { label: 'Collections' }],
        back: { to: '/armies', label: 'Armies' },
        heading: { title: 'Collections' },
        title: 'Collections'
      })
    ).toEqual([{ label: 'Armies', to: '/armies' }]);
  });

  it('keeps every explicit crumb when each has a destination', () => {
    expect(
      resolveAncestors({
        crumbs: [
          { label: 'Armies', to: '/armies' },
          { label: 'Collections', to: '/collections' },
          { label: 'My Marines' }
        ],
        heading: { title: 'My Marines' },
        title: 'My Marines - Collection Tracker'
      })
    ).toEqual([
      { label: 'Armies', to: '/armies' },
      { label: 'Collections', to: '/collections' }
    ]);
  });

  it('uses back as the only ancestor and does not append heading', () => {
    expect(
      resolveAncestors({
        back: { to: '/factions', label: 'Factions' },
        heading: { title: 'Space Marines' },
        title: 'Space Marines - Faction Overview'
      })
    ).toEqual([{ label: 'Factions', to: '/factions' }]);
  });

  it('does not fall back to heading or a short document title', () => {
    expect(resolveAncestors({ heading: { title: 'Collections' }, title: 'Collections' })).toEqual(
      []
    );
    expect(resolveAncestors({ title: 'Settings' })).toEqual([]);
    expect(resolveAncestors({ title: 'depot - Offline Warhammer 40,000 Companion' })).toEqual([]);
    expect(resolveAncestors({ title: 'Gladius Task Force - Detachment' })).toEqual([]);
  });
});
