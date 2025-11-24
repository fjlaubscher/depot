# Test Infrastructure

Centralized testing utilities for consistent, reliable tests. Vitest runs in jsdom with React 19 + Router 7 future flags enabled via `TestWrapper`.

## Files
- `mock-data.ts` — factory-backed mock data (factions, datasheets, rosters, stratagems, enhancements, etc.)
- `test-utils.tsx` — `TestWrapper`, router helpers, mock providers

## Rules
- Always render with `TestWrapper`: `render(<Component />, { wrapper: TestWrapper });`
- Prefer factory mocks (`mockDatasheet`, `createMockFaction`, etc.) over ad-hoc inline objects.
- Use `data-testid` for stable selectors instead of text matching.

## Command Tips
- Single file: `pnpm --filter @depot/web test -- src/routes/home/index.test.tsx`
- Watch mode: `pnpm --filter @depot/web test --watch`
- CI mode: `pnpm --filter @depot/web test:ci` (verbose, fails fast)

## Example Pattern
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet } from '@/test/mock-data';
import Component from './component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component datasheet={mockDatasheet} />, { wrapper: TestWrapper });
    expect(screen.getByTestId('component-root')).toBeInTheDocument();
  });
});
```

## Benefits
- Consistent provider setup across tests
- Factory-driven mocks keep types valid
- Stable selectors reduce flakiness
- Router/context warnings stay silent when `TestWrapper` is used
