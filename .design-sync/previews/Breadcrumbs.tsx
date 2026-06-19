import { Breadcrumbs } from '@depot/web';

// NOTE: Breadcrumbs returns null when useLocation().pathname === '/'. The shared
// provider wraps previews in a MemoryRouter with no initialEntries (defaults to
// '/'), and React Router v7 forbids nesting a second MemoryRouter, so these
// stories render blank until the provider's MemoryRouter is seeded with a
// non-root initialEntries. Explicit `items` are supplied so the trail is correct
// once a route is present.
export const DatasheetTrail = () => (
  <Breadcrumbs
    items={[
      { label: 'Factions', path: '/factions' },
      { label: 'Adeptus Astartes', path: '/factions/adeptus-astartes' },
      { label: 'Intercessor Squad', path: '/factions/adeptus-astartes/intercessor-squad' }
    ]}
  />
);

export const RosterTrail = () => (
  <Breadcrumbs
    items={[
      { label: 'Rosters', path: '/rosters' },
      { label: 'Strike Force Cassius', path: '/rosters/strike-force-cassius' }
    ]}
  />
);

export const TwoLevel = () => (
  <Breadcrumbs
    items={[
      { label: 'Factions', path: '/factions' },
      { label: 'Tyranids', path: '/factions/tyranids' }
    ]}
  />
);
