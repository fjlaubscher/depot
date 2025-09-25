# Test Infrastructure

Centralized testing utilities for consistent, reliable testing.

## Files
- `mock-data.ts` - Mock data with factory functions
- `test-utils.tsx` - TestWrapper and utilities

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
- Layout and Toast contexts
- Proper provider composition

### Use Centralized Mock Data
```typescript
// ✅ Correct
import { mockDatasheet, createMockDatasheet } from '@/test/mock-data';

// ✅ Factory functions for variations
const custom = createMockDatasheet({ name: 'Custom Unit' });

// ❌ Avoid inline mocks
const mockData = { id: 'test' };
```

#### Available Mock Data
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
- **Clean Output**: No router warnings