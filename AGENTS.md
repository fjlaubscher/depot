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

# Start development (generates data + dev server)
pnpm start

# Generate fresh data only
pnpm --filter @depot/cli start

# Force re-download source data
pnpm refresh-data

# Production build
pnpm build

# Code quality
pnpm format  # ALWAYS run before commits
pnpm lint    # TypeScript + formatting checks
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
- All data structures defined in `@depot/core/src/types/depot.ts`
- TypeScript types are the source of truth
- CLI output must match these interfaces exactly

## Scripts

### `scripts/copy-data.mjs`
Utility script that copies generated data from CLI output to web app directory:
- **Source**: `packages/cli/dist/data`
- **Target**: `packages/web/public/data` (dev) or `packages/web/dist/data` (prod)
- Automatically called by `start` and `build` commands

## Requirements
- **Node.js**: >=22.0.0
- **Package Manager**: pnpm >=8.0.0

## File Naming Conventions
- **Components**: kebab-case files, PascalCase exports
- **Hooks**: `use-` prefix with kebab-case
- **Utils/Constants**: kebab-case
- **Types**: kebab-case with `.ts` extension