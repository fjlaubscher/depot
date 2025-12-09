# AGENTS.md

Guidance for working in the `depot` monorepo (pnpm workspace with core, CLI, web, and workers packages).

## Workspace Layout
| Package | Path | Purpose |
| --- | --- | --- |
| `@depot/core` | `packages/core` | Type definitions + shared utilities (single source of truth) |
| `@depot/cli` | `packages/cli` | Fetches Wahapedia CSV exports and emits cleaned JSON |
| `@depot/web` | `packages/web` | React PWA that ships the experience + offline cache |
| `@depot/workers` | `packages/workers` | Cloudflare Workers handlers + shared server-side logic (e.g. roster analysis) |
| Scripts | `scripts/*.mjs` | Supporting utilities (e.g., data copy helper) |

## Common Commands
- `pnpm install` - install workspace dependencies
- `pnpm start` - build core + cli, generate data, copy assets, start web dev server
- `pnpm dev` - start web dev server only (requires data already in `packages/web/public/data`)
- `pnpm --filter @depot/cli start` - generate fresh data (downloads + converts)
- `pnpm refresh-data` - regenerate data and force a re-download
- `pnpm build` - production build: build packages, regenerate data, copy assets
- `pnpm format` / `pnpm lint` / `pnpm typecheck` / `pnpm test` - quality gates (run before commits)
- `pnpm clean` - clean all package outputs

## Data + Build Flow
1. CLI fetches CSV from Wahapedia URLs.
2. CSV is converted to JSON using `@depot/core` types.
3. Output lands in `packages/cli/dist/json/` and `packages/cli/dist/data/`.
4. `scripts/copy-data.mjs` copies `dist/data/` into `packages/web/public/data/`.
5. The web app reads from `public/data/` and caches in IndexedDB for offline use.

### Scripts
- `scripts/copy-data.mjs` deletes the existing `packages/web/public/data` directory, then copies `packages/cli/dist/data` into it. It runs automatically in `pnpm start` and `pnpm build`; manual runs are rarely needed.

## Workers + API
- Cloudflare Pages/Workers entrypoints live under the root `functions/` directory; files there should be thin adapters that forward to handlers in `@depot/workers`.
- `@depot/workers` is pure ESM (NodeNext); avoid Node-only APIs (`fs`, `net`, etc.) and rely on Web-standard APIs supported by Cloudflare Workers.
- Local iteration: `pnpm --filter @depot/workers build`, `dev`, `test` — see `packages/workers/AGENTS.md` for details.

## Type System
- Canonical types live in `@depot/core/src/types/depot.ts` and `@depot/core/src/types/wahapedia.ts`.
- CLI output must match these interfaces exactly; web code should consume the typed shapes without ad-hoc parsing.

## Shared Utilities
- All cross-package helpers now live in `@depot/core/src/utils`. The main entry points are:
  - `utils/common` (slug safety, keyword grouping, enhancement helpers, array sorters, breadcrumb builders).
  - `utils/wargear`, `utils/abilities`, `utils/roster`, `utils/collection`, `utils/datasheets`, `utils/paths`, and `utils/roster-share`.
- Add Vitest coverage beside any new helper in core before wiring it into CLI/web.
- `packages/web/src/utils` should only contain UI-specific wrappers (e.g., tag styles, absolute URL builders that read browser env). When moving a helper into core, delete the old web tests and recreate them beside the new shared file.

## CLI (ESM) Notes
- Pure ESM with NodeNext; compiled output is in `packages/cli/dist`.
- Relative imports inside `packages/cli/src` must include `.js` extensions.
- Prefer `import type { wahapedia, depot } from '@depot/core'` for type-only usage; runtime helpers (e.g., `slug`) should be explicitly imported.
- CLI reads/writes from `packages/cli/dist/{json,data,source_data}`; never point the web app directly at Wahapedia URLs.

## E2E Tests
- Playwright E2E specs live in `packages/web/e2e` and run via `pnpm --filter @depot/web test:e2e`.
- The Playwright config (`packages/web/playwright.config.ts`) starts the dev server on `PORT` (default `5173`) and `HOST` (default `localhost`); you can override the base URL with `WEB_BASE_URL`.

## Monorepo QA Expectations
- Lint/typecheck run across workspaces via `pnpm lint` / `pnpm typecheck`.
- UI/layout changes should update colocated tests (e.g., `packages/web/src/routes/home/index.test.tsx`).
- Before commits: `pnpm format && pnpm lint && pnpm test`.

## Requirements
- Node.js >=24.0.0 (CI pins Node 24)
- pnpm >=10.0.0 (lockfile generated with pnpm 10.20.x)

## Naming Conventions
- Components: kebab-case files, PascalCase exports
- Hooks: `use-` prefix with kebab-case
- Utils/Constants: kebab-case
- Types: kebab-case with `.ts` extension
