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
- `src/index.ts` - exports the `depot` + `wahapedia` type namespaces only
- `src/types/depot.ts` / `src/types/wahapedia.ts` - processed + raw schemas
- `src/utils/common/` - framework-agnostic helpers (array, strings, keywords, enhancements, faction mapping, breadcrumb builders) with colocated tests
- `src/utils/{wargear,abilities,roster,roster-share,collection,datasheets,detachments,model-costs}.ts` - domain helpers consumed by CLI + web
- `src/constants/` - reserved for future shared constants

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
- Treat `src/types/depot.ts` as canonical-update here first, then propagate changes to CLI/web.
- Keep utilities side-effect free and framework agnostic. Anything that needs browser/Node globals belongs in the consumer package with a thin wrapper.
- Every helper file in `src/utils/**` must have a colocated Vitest suite before being consumed elsewhere.
- Runtime helpers are consumed via the `@depot/core/utils/*` subpath exports in `package.json`; add a new entry there when adding a helper file.
- Avoid runtime coupling to Node/browser APIs; pass env/config values in as parameters.
