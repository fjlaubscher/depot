# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

## Project Overview

`depot` is a Warhammer 40,000 companion app powered by Wahapedia data. Built as a monorepo using pnpm workspaces.

**Packages:**
- **@depot/cli**: Fetches and processes Wahapedia CSV data into JSON format
- **@depot/core**: Shared TypeScript types and utilities
- **@depot/web**: React PWA that displays the processed game data

## Key Commands

```bash
# Install dependencies
pnpm install

# Clean all packages
pnpm clean

# Start development (generates data + dev server)
pnpm start

# Start web app dev server only
pnpm dev

# Generate fresh data only
pnpm --filter @depot/cli start

# Force re-download source data
pnpm refresh-data

# Production build
pnpm build

# Code quality
pnpm format  # ALWAYS run before commits
pnpm lint    # TypeScript + formatting checks
pnpm typecheck # Type check all packages
pnpm test    # Run tests
```

## Architecture

### Data Flow
1. CLI fetches CSV from Wahapedia URLs
2. Converts CSV → JSON using `@depot/core` types
3. Outputs to `packages/cli/dist/json/`
4. Web app consumes JSON files from `public/data/`
5. IndexedDB caching for offline-first functionality

### Type System
- All data structures defined in `@depot/core/src/types/depot.ts` and `@depot/core/src/types/wahapedia.ts`
- TypeScript types are the source of truth
- CLI output must match these interfaces exactly

### CLI (ESM) Notes
- `@depot/cli` uses ESM with NodeNext resolution.
- Use explicit `.js` extensions for relative imports inside `@depot/cli/src`.
- Prefer type-only imports from core: `import type { wahapedia, depot } from '@depot/core'`
- Runtime imports from core should be explicit (e.g., `import { slug } from '@depot/core'`).
- The CLI reads/writes from `packages/cli/dist/{json,data,source_data}` at runtime.

### Monorepo Type Checking
- Lint/Typecheck runs across the workspace with `pnpm lint`/`pnpm typecheck`.
- `@depot/cli` resolves `@depot/core` types via TS path mapping, so core does not need to be prebuilt for typechecking.

## Scripts

### `scripts/copy-data.mjs`
This utility script is responsible for copying the generated data from the `@depot/cli` package to the `@depot/web` package. This is a crucial step to ensure the web app has access to the latest data.

- **Source**: `packages/cli/dist/data`
- **Target**: `packages/web/public/data`

It is automatically called by the root `pnpm start` and `pnpm build` commands, so you rarely need to run it manually.

**Implementation Details:**
- The script uses Node.js's `fs/promises` module to recursively copy the directory.
- It first deletes the existing `packages/web/public/data` directory to ensure a clean copy.
- It then copies the `packages/cli/dist/data` directory to `packages/web/public/data`.

## Requirements
- **Node.js**: >=22.0.0
- **Package Manager**: pnpm >=8.0.0

## File Naming Conventions
- **Components**: kebab-case files, PascalCase exports
- **Hooks**: `use-` prefix with kebab-case
- **Utils/Constants**: kebab-case
- **Types**: kebab-case with `.ts` extension
