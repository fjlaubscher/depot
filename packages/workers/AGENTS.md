# AGENTS - @depot/workers

- Target Cloudflare Pages/Workers; keep entrypoints framework-agnostic and avoid Node-only APIs (e.g. `fs`, `net`).
- This package is pure ESM (NodeNext). Use `.js` extensions on relative imports (`./foo.js`), never bare `.ts`.
- Business logic lives here; files in `functions/` must be thin adapters that forward to these handlers.
- Keep handlers pure: accept `(request, env, deps?)` and return a `Response`. Inject external clients (OpenAI, fetch wrappers) for tests rather than hitting the network.
- Tests run with `vitest` in Node; mock external services and do not rely on Cloudflare bindings being present.
-
+ Key commands:
  - `pnpm --filter @depot/workers build` - emit `dist/`
  - `pnpm --filter @depot/workers dev` - tsc watch for local iteration
  - `pnpm --filter @depot/workers test` - vitest (Node environment)
  - `pnpm --filter @depot/workers format` / `lint` / `typecheck` / `clean` - quality and maintenance

Use `functions/api/*` at the repo root as the Cloudflare Pages/Workers entrypoints that call into the compiled handlers exported from `@depot/workers`.
