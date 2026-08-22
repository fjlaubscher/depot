# Release Process (v1+)

This document describes how depot releases are cut, built, and deployed via GitHub Actions and Cloudflare Pages.

## Overview

- **Versioning**: Semantic versioning with git tags (`vX.Y.Z`).
- **Source of truth for data**: Wahapedia-derived `public/data/index.json:dataVersion` produced by `@depot/cli`.
- **Build & deploy**: GitHub Actions `Release` workflow builds the monorepo, uploads Sentry sourcemaps, creates a GitHub release, and deploys to Cloudflare Pages (static assets + functions).
- **PR previews**: `Preview` workflow deploys each open PR to a Cloudflare Pages branch (`pr-<n>`) and comments the `*.pages.dev` URL. That deploy includes `functions/[[path]].ts` (on-the-fly OG/meta rewrite).

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

## Release Workflow (`.github/workflows/release.yml`)

The `Release` workflow runs on:

- `push` to tags matching `v*.*.*` (e.g. `v1.0.0`) — builds, creates the GitHub release, deploys production.
- manual `workflow_dispatch` with a `tag` input (and optional `ref`, default `main`) — creates and pushes the annotated tag. That tag push then runs the release job.

Do not dispatch the workflow without a `vX.Y.Z` tag; a branch-only run would stamp Sentry / the GitHub release with `main`.

### Steps (tag push)

1. **Checkout & setup**
   - Checks out the repo.
   - Sets up pnpm and Node.js 24 with pnpm caching.
2. **Install dependencies**
   - `pnpm install --frozen-lockfile`.
3. **Prepare release metadata**
   - Exports `VITE_SENTRY_RELEASE=${GITHUB_REF_NAME}` and `VITE_APP_VERSION` (tag without the `v`) into the env.
4. **Build core, CLI, data, and web**
   - Commands:
     - `pnpm --filter @depot/core build`
     - `pnpm --filter @depot/cli build`
     - `pnpm --filter @depot/cli start`
     - `node scripts/copy-data.mjs`
     - `pnpm --filter @depot/web build`
5. **Create GitHub release**
   - Uses `softprops/action-gh-release@v3` with `generate_release_notes: true`.
6. **Deploy to Cloudflare Pages**
   - `npx wrangler pages deploy packages/web/dist --project-name depot --branch main`
   - Picks up `functions/` (Pages Functions) from the repo root.

## PR previews (`.github/workflows/preview.yml`)

Mirrors chapterden’s “deploy + comment the URL” loop, on Pages instead of a standalone `workers.dev` worker:

- Depot prod is already Cloudflare Pages. `functions/[[path]].ts` is a Pages Function on the Workers runtime (HTMLRewriter OG tags), not a separate Worker + D1.
- Each open PR deploys `--branch pr-<number>`.
- Stable alias: `https://pr-<number>.depot.pages.dev`.
- The bot comment is upserted (`<!-- depot-preview pr=N -->`). Closing the PR marks the comment stale; Pages keeps the last preview deployment until that branch is overwritten.

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
3. **Tag the release** (either):
   - From Actions: run **Release** with `tag=vX.Y.Z` (optional `ref`, default `main`). The workflow creates the annotated tag and the tag push does the rest.
   - Or locally from an up-to-date `main`:
     - `git tag -a vX.Y.Z -m "vX.Y.Z"`
     - `git push origin vX.Y.Z`
4. **Watch the workflow**
   - Confirm the `Release` workflow passes:
     - Build + Sentry sourcemap upload succeed.
     - GitHub release is created for `vX.Y.Z`.
     - Cloudflare Pages deploy step completes without errors.
5. **Verify production**
   - Load [godepot.dev](https://godepot.dev):
     - Confirm `Last Updated` matches the expected Wahapedia snapshot.
     - Sanity-check core flows (home, factions, rosters).
   - Check Sentry:
     - New release named `vX.Y.Z` exists.
     - Source maps are associated with that release.

## Notes

- If Cloudflare deploy fails for a tag, re-run the **tag-push** `Release` workflow from the Actions tab (not a new `workflow_dispatch`, which would try to recreate the tag).
- If you need a new Wahapedia snapshot before a release, regenerate data locally or in CI via the CLI (`@depot/cli`) before tagging so that `index.json:dataVersion` reflects the new snapshot. The release workflow will then build and deploy that snapshot.
