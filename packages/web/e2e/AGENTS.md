# E2E Tests (Playwright)

End-to-end coverage for the web app using Playwright.

## Commands
- `pnpm --filter @depot/web test:e2e` — run E2E locally (starts dev server per config).
- `pnpm --filter @depot/web dlx playwright install chromium` — install browsers once.

## Test Conventions
- Base config: `packages/web/playwright.config.ts` (dev server on port 4173 by default; override with `WEB_BASE_URL`).
- Keep tests self-contained and stateless; rely on generated data in `packages/web/public/data` (run CLI + copy-data first).
- Prefer stable `data-testid` selectors; fall back to roles only when an element is inherently labeled (e.g., headings). Avoid brittle text queries.
- Assert navigation (`expect(page).toHaveURL(...)`) after clicks.
- Use `trace: 'retain-on-failure'` and include meaningful test names for debugging.

## Adding Tests
- Place specs in this folder with `.spec.ts` suffix.
- If a new flow needs seed data, ensure the CLI output supports it; avoid mocking network.
- When adding new UI affordances, expose stable test ids in the component (aria-labels or `data-testid`).
