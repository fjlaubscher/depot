# Release Process (v1+)

This document describes how depot releases are cut, built, and deployed via GitHub Actions and Cloudflare Pages.

## Overview

- **Versioning**: Semantic versioning with git tags (`vX.Y.Z`).
- **Source of truth for data**: Wahapedia-derived `public/data/index.json:dataVersion` produced by `@depot/cli`.
- **Build & deploy**: GitHub Actions `Release` workflow builds the monorepo, uploads Sentry sourcemaps, creates a GitHub release, and deploys to Cloudflare Pages (static assets + functions).
- **PR previews**: `Preview` workflow deploys a Pages branch `pr-<n>` on the existing `depot` project and comments the `*.pages.dev` URL. Prod stays on Pages (`godepot.dev`).

## Required GitHub Secrets

Configure these in **Settings → Security → Secrets and variables → Actions → Secrets**:

### Cloudflare

- `CLOUDFLARE_API_TOKEN` — same account as chapterden. Prod and PR previews both need `Account → Cloudflare Pages → Edit`.
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

1. **Checkout & setup** — pnpm + Node.js 24.
2. **Install** — `pnpm install --frozen-lockfile`.
3. **Prepare release metadata** — `VITE_SENTRY_RELEASE` + `VITE_APP_VERSION` from the tag.
4. **Build** core, CLI, data, web.
5. **Create GitHub release** — `softprops/action-gh-release@v3`.
6. **Deploy Pages** — `npx wrangler pages deploy packages/web/dist --project-name depot --branch main` (picks up `functions/`).

## PR previews (`.github/workflows/preview.yml`)

Same Cloudflare Pages project as production (`depot`). Each PR deploys a Pages branch and comments the `*.pages.dev` URL. No D1 (depot is a static PWA).

- Pages branch: `pr-<n>`.
- Deploy: `wrangler pages deploy packages/web/dist --project-name depot --branch pr-<n>`.
- URL from wrangler output (`https://pr-<n>.*.pages.dev`, else any `pages.dev`), fallback `https://pr-<n>.depot.pages.dev`.
- Pages Functions in `functions/` still run (same OG/meta rewrite as prod).
- Bot upserts one comment (`<!-- depot-preview pr=N -->`).
- PR close: comment is marked no longer updated (no Worker teardown).

Prod is unchanged (Pages + `godepot.dev`). Previews never deploy `--branch main`.

## Data Versioning

- The CLI writes a `dataVersion` field into `public/data/index.json`.
- On startup, the app reads it from the index, stores it in IndexedDB, resets cached data when it changes, and shows it on the home screen.
- Wahapedia’s exported `dataVersion` is the only source of truth.

## How to Cut a Release

1. Prep `main` (`pnpm format && pnpm lint && pnpm typecheck && pnpm test`).
2. Update `CHANGELOG.md`.
3. Tag: Actions → **Release** → `tag=vX.Y.Z`, or `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
4. Confirm the tag-push `Release` run: build, GitHub release, Pages deploy.
5. Check [godepot.dev](https://godepot.dev) and the Sentry release.

## Notes

- Failed tag deploy: re-run the **tag-push** workflow, do not dispatch a new tag.
- New Wahapedia snapshot: regenerate via `@depot/cli` before tagging.
