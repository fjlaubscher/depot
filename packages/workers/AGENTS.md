# AGENTS - @depot/workers

- Target Cloudflare Pages/Workers; keep entrypoints framework-agnostic and avoid Node-only APIs (e.g. `fs`, `net`).
- This package is pure ESM (NodeNext). Use `.js` extensions on relative imports (`./foo.js`), never bare `.ts`.
- Business logic lives here; files in `functions/` must be thin adapters that forward to these handlers.
- Keep handlers pure: accept `(request, env, deps?)` and return a `Response`. Inject external clients (OpenAI, fetch wrappers) for tests rather than hitting the network.
- Tests run with `vitest` in Node; mock external services and do not rely on Cloudflare bindings being present.
