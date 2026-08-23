# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-08-23

### Added

- One-time PWA install banner at the top of the app, plus an Install row in
  Settings, using Chrome's `beforeinstallprompt`.

### Fixed

- The Review Selection chip is a filled accent control so it reads on dark
  theme, and the datasheet list reserves space so the last Add button is not
  covered on desktop.
- Dark mode surfaces are lifted off OLED-black toward the older gray-800/900
  tones, with borders that actually show.

## [2.0.2] - 2026-08-22

### Fixed

- Android Chrome and the installed PWA no longer treat the home page as taller
  than the visible window. The shell is pinned with `fixed inset-0`, document
  scroll is locked, and `viewport-fit=cover` keeps the tab bar above the
  system gesture bar.
- The running app version is shown in Settings, About, and the desktop rail
  (`depot · {version}`), sourced from the release tag.

## [2.0.1] - 2026-08-22

### Fixed

- Supplement tab count badges no longer render as a black square on coloured
  chapter tabs in dark mode. Active badges now use a translucent white overlay
  with `text-current` so they stay readable on every active tab colour.

## [2.0.0] - 2026-08-22

### Changed

- **Navigation.** The hamburger drawer is replaced by a five-tab bottom bar on the
  root tabs and a fixed 220px rail on desktop. Drill-in screens get a back header
  with icon actions and an optional sticky action bar. `Layout` context,
  `PageHeader`, `Breadcrumbs` and `BackButton` are gone.
- **Accent.** Restored to depot's original orange by aliasing Tailwind's `orange`
  ramp rather than the hand-tuned "signal ember" hexes, so the two cannot drift.
- Faction detachments moved from `?tab=detachments` to `/faction/:slug/detachments`
  so the tab can be linked and shared.
- Detachment names render plain everywhere; DP and force disposition are their own
  tags rather than being glued into the name.
- Roster units group by battlefield role, with points shown on faction datasheet lists.

### Added

- Storage usage meter in Settings, an offline banner, and a toast when the rules
  data version changes underneath you.
- Tooltips on every icon button, derived from the accessible name they already had.

### Fixed

- **Wargear profiles were never grouped.** The parser matched only `' - '` while the
  source uses an en dash, so 1382 rows fell through and every multi-profile weapon
  (plasma pistol, missile launcher…) rendered as separate selectable entries. 641
  weapons now group correctly, and selections saved before the fix rebind by base
  name on refresh.
- `D6+1` damage values no longer overflow the wargear table, and stat columns widen
  past `sm` instead of leaving the name column to swallow the viewport.
- The collection state chart, previously the last thing using raw palette values,
  is on design tokens and legible in light mode.

## [1.0.0] - 2025-12-04

### Added

- Initial stable release of the depot monorepo.
- `@depot/core` shared types and utilities for Wahapedia CSV and app-ready data.
- `@depot/cli` for fetching Wahapedia exports and emitting cleaned JSON payloads.
- `@depot/web` React PWA with offline roster building and datasheet browsing.
- `@depot/workers` Cloudflare worker handlers powering server-side features.
- CI workflows for build, lint/typecheck/test, and Playwright E2E coverage.
