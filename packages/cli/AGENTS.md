# CLI Package

Fetches Warhammer 40K data from Wahapedia CSV exports and converts them into the JSON payloads the PWA consumes. Everything here is ESM (NodeNext) and relies on the `@depot/core` types as the contract between raw CSV and UI-facing data.

## Key Commands

```bash
# Build TypeScript once (emits to dist/)
pnpm --filter @depot/cli build

# Generate data from Wahapedia (expects dist/ output)
pnpm --filter @depot/cli start

# Force re-download source data
pnpm --filter @depot/cli start -- --force-download

# Watch mode (tsc --watch)
pnpm --filter @depot/cli dev

# Run tests
pnpm --filter @depot/cli test

# Format code
pnpm --filter @depot/cli format

# Lint code (tsc + prettier check)
pnpm --filter @depot/cli lint

# Type check
pnpm --filter @depot/cli typecheck

# Clean dist folder
pnpm --filter @depot/cli clean
```

## Processing Pipeline

1. **Fetch** (`index.ts`): Downloads CSV files from Wahapedia URLs defined in `src/config/supplements.ts`.
2. **Convert** (`convert-to-json.ts`): Transforms CSV → JSON with cleaning + normalization.
3. **Generate** (`generate-data.ts`): Builds faction-specific consolidated files with metadata for the PWA.
   - Forge World / Legends flags flow through `buildSourceClassifier` (`src/utils/source-classification.ts`). Do not add bespoke string matching elsewhere—extend the helper instead so CLI + web stay consistent.

## Output Structure

- `dist/json/` - Individual converted CSV files
- `dist/data/` - Faction-specific files for web app
- `dist/data/index.json` - Navigation index
- `dist/source_data/` - Cached raw CSV pulls

The web package never fetches Wahapedia directly. Run a CLI build (or root `pnpm start`/`pnpm build`) and then call `node scripts/copy-data.mjs` to place the contents into `packages/web/public/data/`.

## Type System

- Uses `@depot/core` types as source of truth
- `wahapedia.*` types = raw CSV structure
- `depot.*` types = processed web-ready format
- Transformation in `generate-data.ts`

### Import rules
- Relative imports inside `src/` must include `.js` extensions to satisfy NodeNext.
- Use `import type` when pulling interfaces from `@depot/core` to keep emitted JS lean.
- Keep runtime helpers inside `src/utils/` to avoid circular dependencies between the main pipeline steps.
