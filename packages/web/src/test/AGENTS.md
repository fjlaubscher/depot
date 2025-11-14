# Test Infrastructure

Centralized testing utilities for consistent, reliable testing. Vitest runs in jsdom with React 19 + Router 7 future flags enabled via `TestWrapper`.

## Files
- `mock-data.ts` - Mock data with factory functions (factions, datasheets, rosters, etc.)
- `test-utils.tsx` - `TestWrapper`, router helpers, mock providers

## Testing Rules

### Always Use TestWrapper
```typescript
// ✅ Correct
render(<Component />, { wrapper: TestWrapper });

// ❌ Never
render(<Component />);
```

TestWrapper provides:
- React Router v7 with future flags
- Layout/App/Roster/Toast contexts
- Sentry + theme defaults

### Use Centralized Mock Data
```typescript
// ✅ Correct
import { mockDatasheet, createMockDatasheet } from '@/test/mock-data';

// ✅ Factory functions for variations
const custom = createMockDatasheet({ name: 'Custom Unit' });

// ❌ Avoid inline mocks
const mockData = { id: 'test' };
```

#### Available Mock Data (see `mock-data.ts`)
- `mockDatasheet` / `createMockDatasheet()` - Unit cards
- `mockFaction` / `createMockFaction()` - Faction data
- `mockStratagem` / `createMockStratagem()` - Stratagems
- `mockEnhancement` - Character upgrades
- `mockRoster` / `createMockRoster()` - Roster data
- `mockRosterUnit` / `createMockRosterUnit()` - Roster units
- Specialized variants: `mockEmptyFaction`, `mockFullRoster`, etc.

### Prefer data-testid
```typescript
// ✅ Reliable
const element = screen.getByTestId('unit-composition');
expect(element).toHaveTextContent('Captain');

// ❌ Fragile
expect(screen.getByText('Captain')).toBeInTheDocument();
```

### Command Tips
- Run a single file: `pnpm --filter @depot/web test -- src/routes/home/index.test.tsx`
- Watch mode while iterating: `pnpm --filter @depot/web test --watch`
- CI mode (`pnpm --filter @depot/web test:ci`) uses verbose reporter and fails fast.

## Test Pattern

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

- **Consistency**: Same provider setup everywhere
- **Maintainability**: Single source for test utilities
- **Type Safety**: Factory functions ensure proper interfaces
- **Clean Output**: Router + context warnings stay silent when TestWrapper is used
