# Release Process (v1+)

This document describes how depot releases are cut, built, and deployed via GitHub Actions and Cloudflare Pages.

## Overview

- **Versioning**: Semantic versioning with git tags (`vX.Y.Z`).
- **Source of truth for data**: Wahapedia-derived `public/data/index.json:dataVersion` produced by `@depot/cli`.
- **Build & deploy**: GitHub Actions `Release` workflow builds the monorepo, uploads Sentry sourcemaps, creates a GitHub release, and deploys to Cloudflare Pages (static assets + functions).

## Required GitHub Secrets

Configure these in **Settings → Security → Secrets and variables → Actions → Secrets**:

### Cloudflare Pages

- `CLOUDFLARE_API_TOKEN` — API token with `Account → Cloudflare Pages → Edit` for the account that owns the `depot` Pages project.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID for that account.

### Sentry (sourcemaps + client config)

- `VITE_SENTRY_DSN` — Sentry DSN used by the web client.
- `VITE_SENTRY_ENVIRONMENT` — Environment name (e.g. `production`).
- `VITE_SENTRY_AUTH_TOKEN` — Sentry auth token for sourcemap upload.
- `VITE_SENTRY_ORG` — Sentry org slug.
- `VITE_SENTRY_PROJECT` — Sentry project slug.

> `VITE_SENTRY_RELEASE` is set automatically from the git tag inside the workflow.

### OpenAI / Workers (Cloudflare-side)

These are not used directly in the GitHub workflow but must be configured in Cloudflare:

- `OPENAI_API_KEY` — required by the Cogitator worker.
- `OPENAI_MODEL` (optional) — overrides the default model if needed.

## Release Workflow (`.github/workflows/release.yml`)

The `Release` workflow runs on:

- `push` to tags matching `v*.*.*` (e.g. `v1.0.0`), and
- manual `workflow_dispatch`.

### Steps

1. **Checkout & setup**
   - Checks out the repo.
   - Sets up pnpm and Node.js 22 with pnpm caching.
2. **Install dependencies**
   - `pnpm install --frozen-lockfile`.
3. **Prepare Sentry release name**
   - Exports `VITE_SENTRY_RELEASE=${GITHUB_REF_NAME}` (e.g. `v1.0.0`) into the env.
4. **Build core, CLI, data, and web**
   - Commands:
     - `pnpm --filter @depot/core build`
     - `pnpm --filter @depot/cli build`
     - `pnpm --filter @depot/cli start`
     - `node scripts/copy-data.mjs`
     - `pnpm --filter @depot/web build`
   - Environment for the build:
     - `VITE_SENTRY_DSN`
     - `VITE_SENTRY_ENVIRONMENT`
     - `VITE_SENTRY_AUTH_TOKEN`
     - `VITE_SENTRY_ORG`
     - `VITE_SENTRY_PROJECT`
     - `VITE_SENTRY_RELEASE`
   - The Vite config (`packages/web/vite.config.ts`) uses these to:
     - Enable Sentry sourcemap upload.
     - Create/update a Sentry release named after the tag (e.g. `v1.0.0`).
5. **Create GitHub release**
   - Uses `softprops/action-gh-release@v2` with `generate_release_notes: true`.
   - No build artifacts (e.g. zipped data) are attached to avoid redistributing Wahapedia rules data directly.
6. **Deploy to Cloudflare Pages**
   - Runs:
     - `npx wrangler pages deploy packages/web/dist --project-name depot --branch main`
   - Uses:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`
   - This deploys:
     - The static assets in `packages/web/dist`, and
     - The functions under `functions/` (Pages Functions), picked up automatically by Wrangler.

## Data Versioning

- The CLI writes a `dataVersion` field into `public/data/index.json`.
- On startup, the app:
  - Reads `dataVersion` from the index.
  - Stores it in IndexedDB.
  - Resets cached data when the version changes.
  - Displays it on the home screen (`Last Updated: …`).
- There is no longer any baked-in or env-driven fallback data version; Wahapedia’s exported `dataVersion` is the only source of truth.

## How to Cut a Release

1. **Prep main**
   - Ensure `main` is green:
     - `pnpm format`
     - `pnpm lint`
     - `pnpm typecheck`
     - `pnpm test`
   - Optionally run E2E locally or via the Playwright workflow.
2. **Update docs**
   - Update `CHANGELOG.md` with the new version and notes.
   - Commit any documentation or UI copy changes tied to the release.
3. **Tag the release**
   - From an up-to-date `main`:
     - `git tag -a vX.Y.Z -m "vX.Y.Z"`
     - `git push origin vX.Y.Z`
4. **Watch the workflow**
   - Confirm the `Release` workflow passes:
     - Build + Sentry sourcemap upload succeed.
     - GitHub release is created for `vX.Y.Z`.
     - Cloudflare Pages deploy step completes without errors.
5. **Verify production**
   - Load the deployed app:
     - Confirm `Last Updated` matches the expected Wahapedia snapshot.
     - Sanity-check core flows (home, factions, rosters, Cogitator).
   - Check Sentry:
     - New release named `vX.Y.Z` exists.
     - Source maps are associated with that release.

## Notes

- If Cloudflare deploy fails for a tag, you can re-run just the `Release` workflow from the Actions tab.
- If you need a new Wahapedia snapshot before a release, regenerate data locally or in CI via the CLI (`@depot/cli`) before tagging so that `index.json:dataVersion` reflects the new snapshot. The release workflow will then build and deploy that snapshot.

