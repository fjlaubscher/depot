# Core Package

Shared TypeScript types + lightweight utilities. This package is the single source of truth for all structures flowing between the CLI and the web app.

## Key Commands
- `pnpm --filter @depot/core build` — emit `dist/`
- `pnpm --filter @depot/core dev` — tsc watch
- `pnpm --filter @depot/core format` — prettier write
- `pnpm --filter @depot/core lint` — tsc noEmit + prettier check
- `pnpm --filter @depot/core typecheck` — type-only check
- `pnpm --filter @depot/core clean` — remove `dist/`

## File Structure
- `src/index.ts` — exports types + utils
- `src/types/depot.ts` — application-ready types
- `src/types/wahapedia.ts` — raw Wahapedia CSV types
- `src/utils/slug.ts` — shared slug helper
- `src/constants/` — reserved for shared constants

## Type Domains
- `depot.*` — web-consumption shapes (factions, datasheets, stratagems, enhancements, settings, rosters)
- `wahapedia.*` — raw CSV schemas as downloaded from Wahapedia

Data flow: `Wahapedia CSV -> wahapedia.* -> CLI processing -> depot.* -> web app`.

## Usage Patterns
```typescript
// CLI package
import type { wahapedia, depot } from '@depot/core';

// Web package
import type { depot } from '@depot/core';

// Shared utility
import { slug } from '@depot/core/utils/slug';
```

## Guidelines
- Treat `src/types/depot.ts` as canonical—update here first, then propagate changes to CLI/web.
- Keep utilities side-effect free and framework agnostic.
- Prefer re-exports via `src/index.ts` so consumers import from `@depot/core` without deep links.
- Avoid runtime coupling to Node/browser APIs; this package must stay portable.
