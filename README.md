# depot

A Warhammer 40,000 companion app powered by [Wahapedia](https://wahapedia.ru) data. Build army lists, browse datasheets, and plan your crusades with offline-capable tools.

*"Knowledge is power, guard it well."*

---

## Requirements

- Node.js >= 24.0.0 (CI pins Node 24)
- pnpm >= 10.0.0

Install dependencies once:

```bash
pnpm install
```

---

## Monorepo Overview

This is a pnpm workspace with four main packages:

- **`@depot/core`** (`packages/core`)  
  Shared TypeScript types and pure utilities. This is the canonical source of truth for data structures flowing between CLI, web, and workers.

- **`@depot/cli`** (`packages/cli`)  
  Fetches Wahapedia CSV exports, converts them into typed JSON, and emits the data consumed by the PWA.

- **`@depot/web`** (`packages/web`)  
  React PWA (Vite + Tailwind) with IndexedDB offline storage for factions, datasheets, rosters, and collections.

- **`@depot/workers`** (`packages/workers`)  
  Cloudflare Pages/Workers handlers (for example, the Cogitator API). Root `functions/` files are thin adapters into this package.

Core stack:

- React 19
- React Router DOM 7
- Vite 6
- Tailwind CSS v4
- TypeScript 5.9+

See `AGENTS.md` files (root and per-package) for deeper guidance.

---

## Running the App

### One-command dev (recommended)

```bash
pnpm start
```

This will:

1. Build `@depot/core` and `@depot/cli`.
2. Run the CLI to download Wahapedia CSVs and convert them to JSON.
3. Copy generated data into `packages/web/public/data/`.
4. Start the web dev server.

Open the app at the URL Vite prints (typically `http://localhost:5173`).

### Web-only dev (reuse existing data)

If you already have data in `packages/web/public/data/`:

```bash
pnpm --filter @depot/web dev
```

Use this for quick UI-only work when you don’t need fresh Wahapedia data.

### Regenerating data

From the root:

```bash
pnpm --filter @depot/cli build     # compile CLI
pnpm --filter @depot/cli start     # download + convert CSV -> JSON
pnpm refresh-data                  # force a re-download + regenerate
```

The CLI writes to:

- `packages/cli/dist/json/` – raw converted CSV files
- `packages/cli/dist/data/` – faction payloads + navigation index

`scripts/copy-data.mjs` copies `dist/data/` into `packages/web/public/data/` (run automatically by `pnpm start` / `pnpm build`).

---

## Package Commands

### Root helpers

```bash
pnpm start         # build core+cli, generate data, copy assets, start web dev server
pnpm dev           # start web dev server only (expects data in packages/web/public/data)
pnpm build         # production build (all packages, fresh data, copy assets)
pnpm format        # format across the workspace
pnpm lint          # lint/typecheck across the workspace
pnpm typecheck     # type-only check
pnpm test          # run tests
pnpm clean         # clean all package outputs
```

### `@depot/core`

```bash
pnpm --filter @depot/core build
pnpm --filter @depot/core dev
pnpm --filter @depot/core test
pnpm --filter @depot/core format
pnpm --filter @depot/core lint
pnpm --filter @depot/core typecheck
pnpm --filter @depot/core clean
```

### `@depot/cli`

```bash
pnpm --filter @depot/cli build           # TypeScript build to dist/
pnpm --filter @depot/cli start           # run compiled CLI
pnpm --filter @depot/cli start -- --force-download  # force fresh CSV downloads
pnpm --filter @depot/cli dev             # tsc -b --watch
pnpm --filter @depot/cli test
pnpm --filter @depot/cli format
pnpm --filter @depot/cli lint
pnpm --filter @depot/cli typecheck
pnpm --filter @depot/cli clean
```

### `@depot/web`

```bash
pnpm --filter @depot/web dev             # dev server (requires data)
pnpm --filter @depot/web build           # production build
pnpm --filter @depot/web preview         # preview production build
pnpm --filter @depot/web test            # unit/integration tests (Vitest)
pnpm --filter @depot/web test:ci         # CI-friendly test run
pnpm --filter @depot/web test:e2e        # Playwright E2E tests
pnpm --filter @depot/web format
pnpm --filter @depot/web lint
pnpm --filter @depot/web typecheck
pnpm --filter @depot/web clean
pnpm --filter @depot/web generate-pwa-assets
```

### `@depot/workers`

```bash
pnpm --filter @depot/workers build
pnpm --filter @depot/workers dev
pnpm --filter @depot/workers test
pnpm --filter @depot/workers format
pnpm --filter @depot/workers lint
pnpm --filter @depot/workers typecheck
pnpm --filter @depot/workers clean
```

Cloudflare Pages/Workers entrypoints live under `functions/` and should be thin adapters that delegate to compiled handlers from `@depot/workers`.

---

## Data Flow

1. CLI fetches CSV files from Wahapedia URLs defined in `packages/cli/src/config/supplements.ts`.
2. CSV data is converted into typed JSON using `@depot/core` types (`wahapedia.*` raw, `depot.*` processed).
3. Output is written to `packages/cli/dist/json/` and `packages/cli/dist/data/` (including `index.json` navigation).
4. `scripts/copy-data.mjs` copies `dist/data/` to `packages/web/public/data/`.
5. The web app reads from `public/data/`, normalizes into `depot.*` shapes with `@depot/core/utils/*`, and caches results in IndexedDB for offline use.

All cross-package helpers live in `@depot/core/src/utils`; web code should not introduce ad-hoc data shaping when shared helpers exist.

---

## Observability (Sentry)

The web client can report unhandled errors to Sentry.

Frontend env vars:

- `VITE_SENTRY_DSN` – Sentry client DSN
- `VITE_SENTRY_ENVIRONMENT` (optional) – display environment name; defaults to build mode

CI / build env vars (for source maps):

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

When deploying (e.g. Cloudflare Pages), configure matching environment variables/secrets so the build step can upload source maps and the runtime can send events.

---

## Privacy

The published app exposes a privacy policy at `/privacy`. Update the content in `packages/web/src/routes/privacy/index.tsx` if data practices change.

---

## Legal / IP

depot is a free, open-source fan project intended for personal hobby use via the web. It is not monetised, has no in-app purchases or ads, and is not distributed via any app stores.

depot is not affiliated with, endorsed by, or sponsored by Games Workshop Limited. All related names, logos, imagery, and trademarks remain the property of their respective owners. Please support the official publications and products wherever you can.

Game data is derived from Wahapedia exports. Wahapedia is unaffiliated with Games Workshop and unaffiliated with depot; this project simply transforms its public CSV exports into offline JSON so you can browse and tinker with lists.

---

## License

MIT License – see `LICENSE.md`.

---

![Depot](depot.jpeg)
*Generated by gpt-image-1*

*Knowledge is power, guard it well.*
