# CLI Package

Fetches Wahapedia CSV exports and converts them into the JSON payloads the PWA consumes. Everything here is ESM (NodeNext) and relies on `@depot/core` types as the contract between raw CSV and UI-facing data.

## Key Commands
- `pnpm --filter @depot/cli build` — TypeScript build to `dist/`
- `pnpm --filter @depot/cli start` — run compiled CLI to download/convert data
- `pnpm --filter @depot/cli start -- --force-download` — force fresh CSV downloads
- `pnpm --filter @depot/cli dev` — `tsc -b --watch`
- `pnpm --filter @depot/cli test` — Vitest
- `pnpm --filter @depot/cli format` — prettier write
- `pnpm --filter @depot/cli lint` — tsc + prettier check
- `pnpm --filter @depot/cli typecheck` — type-only check
- `pnpm --filter @depot/cli clean` — remove `dist/`

## Processing Pipeline
1. **Fetch** (`src/index.ts`): Downloads CSVs from URLs in `src/config/supplements.ts`.
2. **Convert** (`src/convert-to-json.ts`): Transforms CSV -> JSON with cleaning/normalization.
3. **Generate** (`src/generate-data.ts`): Builds faction-level payloads and navigation index consumed by the web app.
   - Forge World / Legends flags flow through `buildSourceClassifier` (`src/utils/source-classification.ts`); extend this helper instead of adding ad-hoc string matching.

## Output
- `dist/json/` — individual converted CSV files
- `dist/data/` — faction payloads for the web app
- `dist/data/index.json` — navigation index
- `dist/source_data/` — cached raw CSV pulls

The web package never fetches Wahapedia directly. Run the CLI (or root `pnpm start`/`pnpm build`) then `node scripts/copy-data.mjs` moves `dist/data/` into `packages/web/public/data/`.

## Type System
- Uses `@depot/core` as the source of truth (`wahapedia.*` raw, `depot.*` processed).
- Transformations in `generate-data.ts` must adhere to these interfaces.

## Import Rules (NodeNext)
- Relative imports inside `src/` must include `.js` extensions in source files.
- Use `import type` for type-only pulls from `@depot/core` to keep emitted JS lean.
- Keep runtime helpers in `src/utils/` to avoid circular dependencies between main pipeline steps.
