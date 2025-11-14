# Core Package

Shared TypeScript types + lightweight utilities. This package is the single source of truth for all structures flowing between the CLI and the web app.

## Key Commands

```bash
# Build once
pnpm --filter @depot/core build

# Watch mode
pnpm --filter @depot/core dev

# Format code
pnpm --filter @depot/core format

# Lint code
pnpm --filter @depot/core lint

# Type check
pnpm --filter @depot/core typecheck

# Clean dist folder
pnpm --filter @depot/core clean
```

## File Structure

```
src/
├── index.ts              # Package exports (types + utils)
├── types/
│   ├── depot.ts          # Application-ready types
│   └── wahapedia.ts      # Raw CSV data types
├── utils/
│   └── slug.ts           # Shared slug helper used by CLI/web
└── constants/            # Any future shared constants live here
```

## Type System

### `depot.*` Types
Application-ready data structures for web consumption:
- `depot.Faction` - Complete faction with nested data
- `depot.Datasheet` - Unit cards with abilities, profiles, wargear
- `depot.Stratagem` - Faction stratagems with CP costs
- `depot.Enhancement` - Character upgrades
- `depot.Settings` - User preferences

### `wahapedia.*` Types
Raw CSV data structure from Wahapedia exports:
- `wahapedia.Datasheet` - Raw datasheet CSV format
- `wahapedia.Ability` - Raw ability CSV format
- `wahapedia.Stratagem` - Raw stratagem CSV format

## Data Flow

```
Wahapedia CSV → wahapedia.* → CLI processing → depot.* → Web app
```

## Usage

```typescript
// CLI package
import { wahapedia, depot } from '@depot/core';

// Web package
import { depot } from '@depot/core';

// Shared utility
import { slug } from '@depot/core/utils/slug';
```

## Guidelines
- Treat `types/depot.ts` as canonical—update here first, then propagate to CLI/web.
- Keep utilities side-effect free and framework agnostic.
- Prefer type re-exports via `src/index.ts` so consumers can import from `@depot/core` without deep linking.
