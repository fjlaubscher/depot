# design-sync notes — @depot/web

The design system is **embedded in the `@depot/web` app**, not a standalone published
library. This shape is off the converter's default envelope, so a few pieces are
custom. Read this before re-syncing.

## Shape / approach
- **shape: package.** The DS is `packages/web/src/components/ui/*` — React 19 function
  components, mostly **default exports** in kebab-case dirs, styled with **Tailwind v4
  utility classes** (no shipped component CSS; it's generated at build time).
- There is **no library entry and no shipped `.d.ts`**, so `.design-sync/prepare-build.mjs`
  (the `cfg.buildCmd`) generates the three inputs the converter needs, all from
  `cfg.componentSrcMap` (the single source of truth for the component set):
  1. `packages/web/.ds-entry.tsx` — barrel of NAMED re-exports. Default exports become
     `export { default as <Name> }`; every file also gets `export *` so composition
     sub-parts that are separate named exports (e.g. `TableHeader/TableRow/TableCell`)
     reach `window.DepotUI`. `export *` never carries the default, so no clash.
  2. `packages/web/.ds-providers.tsx` — re-exports `MemoryRouter` (the `cfg.provider`).
     Several components use react-router (`Breadcrumbs` → `useLocation`; `LinkCard`,
     `ErrorState` → `Link`); without the router wrapper their previews throw.
  3. `packages/web/dist/types/**` — declarations via `tsc -b` (the `typecheck` script,
     `emitDeclarationOnly`). The converter's `findTypesRoot` auto-finds `dist/types`;
     `propsBodyFor` reads `<Name>Props` from there. No `package.json` `types` field is
     added — discovery is driven entirely by `cfg.componentSrcMap`.
  4. `packages/web/dist/ds-styles.css` — the compiled Tailwind stylesheet (`cfg.cssEntry`),
     produced via the `@tailwindcss/postcss` API with content auto-detection (run from
     `packages/web`). The brand webfont `@import` (Atkinson Hyperlegible, Google Fonts)
     is prepended — it ships as `[FONT_REMOTE]` (the app loads it via `<link>` in
     `index.html`; no local font files).
- All four generated files are **gitignored**; only `prepare-build.mjs`, `config.json`,
  the group stubs, the `previews/`, and the `overrides/` fork are committed.

## Excluded from the DS (deliberately, not in componentSrcMap)
- `Layout` (`ui/layout`) — app shell: needs layout context + router + app singletons.
- `ToastContainer` (`ui/toast-container`) — needs the app toast context. (`Toast` itself
  is included — it takes a `toast` prop and renders standalone.)
- `ui/dashboard-card` — empty dir, no implementation.

## Grouping (the source-kit fork)
- `.design-sync/overrides/source-kit.mjs` is a **fork** (declared in `cfg.libOverrides`):
  it neutralizes the path-based group derivation so `cfg.docsMap` category frontmatter is
  the single source of grouping. Reason: the stock derivation turns kebab dirs into
  inconsistent `general`/kebab groups that block the docsMap category override.
- Groups come from 6 stub `.md` files in `.design-sync/groups/` referenced by
  `cfg.docsMap`: **actions, forms, feedback, data-display, navigation, layout**. The stubs
  are frontmatter-only (`category:` line) → group only, no doc body (prompt.md stays
  synthesized from `.d.ts` + previews).
- The fork imports its siblings from `../../.ds-sync/lib/` and needs `ts-morph` resolvable
  from its location → a gitignored `.design-sync/node_modules` junction to
  `.ds-sync/node_modules`. **On a fresh clone, recreate it** (the install + junction are in
  the re-sync steps below).

## Re-sync steps (from repo root)
1. `pnpm install` if needed.
2. Re-copy staged scripts: `cp -r <skill>/package-build.mjs <skill>/package-validate.mjs <skill>/package-capture.mjs <skill>/resync.mjs <skill>/lib <skill>/storybook .ds-sync/` and `(cd .ds-sync && npm i esbuild ts-morph @types/react)`.
3. Recreate the fork's module link (fresh clone only): a `.design-sync/node_modules`
   junction/symlink → `.ds-sync/node_modules` (the fork imports `ts-morph`).
4. Playwright for the render check: chromium build **1200** (playwright/playwright-core
   **1.57.0**) is what the repo pins and what was cached. Install `playwright@1.57.0` into
   `.ds-sync` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`; browsers live at the Windows
   default `%LOCALAPPDATA%\ms-playwright`.
5. Run the driver: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules packages/web/node_modules --entry packages/web/.ds-entry.tsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json` (fetch the project's `_ds_sync.json` to that path first). The driver runs `cfg.buildCmd` (prepare-build) itself.

## Known render warns
- `[FONT_REMOTE] "Atkinson Hyperlegible"` — expected (remote webfont @import). Not an issue.
- **Drawer** reports `thin` in `.render-check.json` — expected. It's `cfg.overrides.Drawer`
  `cardMode: single` (an overlay/portal panel); the single card is short by design and its
  content (the OpenRight filter panel) renders correctly. Triaged, not a failure.
- 6 components needed `cfg.overrides.*` `cardMode` for `[GRID_OVERFLOW]` (wide/escaping
  cards): ContentCard / StatCard / StatsRow / PageHeaderSkeleton / TabsSkeleton → `column`;
  Drawer → `single` (primaryStory `OpenRight`). These are presentation-only (don't clear
  grades). Resolved — re-syncs should keep them.
- The `cfg.provider` MemoryRouter is seeded with `initialEntries:
  ["/factions/adeptus-astartes/intercessor-squad"]` because `Breadcrumbs` returns `null`
  at route `/`. Changing `provider` clears ALL grades (it's in the global grade slice), so
  avoid churning it.

## Re-sync risks (what can silently go stale)
- **Adding/removing a ui component**: update `cfg.componentSrcMap` (drives the barrel,
  discovery, AND grouping via docsMap) AND add a `cfg.docsMap` entry pointing at the right
  group stub. Neither auto-detects new components. A new component with no docsMap entry
  lands in `general`.
- **Tailwind theme/utility changes** in `src/styles/main.css` flow through automatically
  (the CSS is regenerated each build), but a brand-new custom `@utility` only ships if some
  component actually uses it (Tailwind content detection).
- **The source-kit fork** must be diffed against the bundled `lib/source-kit.mjs` on
  upstream skill updates and re-merged if the adapter changed.
- **Provider**: if a NEW component reads a different context (not router), previews will
  render blank — add it to `cfg.provider` (chain via `inner`).
- The webfont depends on Google Fonts being reachable at design render time.

## Possible future improvements
- Per-component docs: the group stubs carry no body, so each `.prompt.md` is synthesized.
  Real per-component `.md` docs (sibling files or a docs dir) would enrich the design
  agent's usage reference.
