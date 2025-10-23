# Web Package

React PWA that displays Warhammer 40K game data. Offline-capable with IndexedDB caching.

## Key Commands

```bash
# Start development (generates data + dev server)
pnpm start

# Dev server only (requires existing data)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests in CI mode
pnpm test:ci

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Clean dist folder
pnpm clean

# Generate PWA assets
pnpm generate-pwa-assets
```

## Technology Stack

- **React 19** + React Router DOM v7
- **Context + useReducer** for state management
- **IndexedDB** for offline-first data storage
- **Tailwind CSS v4** for styling
- **Vite 6** for build tooling
- **Vitest** + React Testing Library for testing

## Key Routes

- `/` - Home dashboard
- `/factions` - Browse all factions
- `/faction/:factionSlug` - Faction overview
- `/faction/:factionSlug/datasheet/:datasheetSlug` - Datasheet details
- `/rosters` - Saved roster list
- `/rosters/create` - Create roster wizard
- `/rosters/:rosterId` - Read-only roster view
- `/rosters/:rosterId/edit` - Roster editor
- `/rosters/:rosterId/add-units` - Datasheet picker for a roster
- `/rosters/:rosterId/units/:unitId/edit` - Unit loadout editor
- `/settings` - Application preferences
- `*` - Not Found fallback

## Architecture

### State Management
- **App Context**: Global data, faction cache, settings
- **Layout Context**: UI state (sidebar, responsive)
- **Toast Context**: Notifications
- **Roster Context**: Roster building state

### Data Flow
1. **Fetch**: Load JSON files from `/public/data/` or network
2. **Cache**: Store in IndexedDB for offline access
3. **Context**: Global state management with React contexts
4. **Components**: Consume data through hooks and contexts

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI library
│   └── shared/         # Domain-specific components
├── contexts/           # React contexts for state
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── utils/              # Business logic utilities
├── data/               # IndexedDB and data utilities
├── constants/          # App constants
└── styles/             # Global styles
```

## Key Utilities

### `utils/`
- `abilities.ts` - Helpers for faction and datasheet ability display
- `array.ts` - Shared sorting utilities
- `datasheet.ts` - Datasheet grouping/filter helpers
- `faction.ts` - Faction filtering, grouping, and detachment helpers
- `keywords.ts` - Keyword labelling helpers
- `paths.ts` - App/data URL construction
- `roster.ts` - Roster formatting, export, and role grouping
- `wargear.ts` - Loadout parsing and default selection helpers

### `hooks/`
- `use-datasheet-browser.ts` - Shared search + filter state for datasheet lists
- `use-debounce.ts` - Generic debounce helper
- `use-faction.ts` - Single faction loader (context-backed)
- `use-factions.ts` - Faction index loader with caching
- `use-local-storage.ts` - Browser storage helper
- `use-my-factions.ts` - Favourites loader/persistence (legacy)
- `use-roster-unit-selection.ts` - Pending unit selection management
- `use-rosters.ts` - IndexedDB-backed roster CRUD
- `use-scroll-collapse.ts` - Sticky footer management for selection summary
- `use-select.ts` - Headless select control helper

### `data/`
- `offline-storage.ts` - IndexedDB data persistence layer
- `indexed-db.ts` - Database schema and operations

## Data Requirements

- `public/data/index.json` – Faction navigation index produced by `@depot/cli`
- `public/data/{factionSlug}.json` – Individual faction payloads consumed by the PWA
- Run `pnpm --filter @depot/cli start` (or a root `pnpm start`/`pnpm build`) when data needs to be regenerated
