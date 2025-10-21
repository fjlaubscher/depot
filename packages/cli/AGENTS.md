# CLI Package

Fetches Warhammer 40K data from Wahapedia CSV exports and converts to structured JSON.

## Key Commands

```bash
# Generate data from Wahapedia
pnpm start

# Force re-download source data
pnpm start -- --force-download

# Build TypeScript
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Clean dist folder
pnpm clean
```

## Processing Pipeline

1. **Fetch** (`index.ts`): Downloads CSV files from Wahapedia URLs
2. **Convert** (`convert-to-json.ts`): Transforms CSV → JSON with cleaning
3. **Generate** (`generate-data.ts`): Builds faction-specific consolidated files
   - Forge World / Legends flags now flow through `buildSourceClassifier` (`src/utils/source-classification.ts`), which inspects faction-pack names. Do not reintroduce ad-hoc string checks elsewhere—reuse the helper so downstream consumers stay in sync.

## Output Structure

- `dist/json/` - Individual converted CSV files
- `dist/data/` - Faction-specific files for web app
- `dist/data/index.json` - Navigation index

## Type System

- Uses `@depot/core` types as source of truth
- `wahapedia.*` types = raw CSV structure
- `depot.*` types = processed web-ready format
- Transformation in `generate-data.ts`
