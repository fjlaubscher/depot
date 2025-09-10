# Test Infrastructure Guidelines

Centralized testing utilities for consistent, reliable testing across the application.

## Files
- `mock-data.ts` - Reusable mock data with factory functions
- `test-utils.tsx` - Common test wrappers and utilities

## Key Testing Rules

### 1. ALWAYS Use TestWrapper for Component Rendering
```typescript
// ❌ Never use custom wrappers or plain render
render(<Component />);
render(<Component />, { wrapper: BrowserRouter });

// ✅ Always use centralized TestWrapper
render(<Component />, { wrapper: TestWrapper });
```

The `TestWrapper` provides:
- React Router with v7 future flags (eliminates warnings)
- Layout Context for UI state management
- Toast Context for notifications
- Proper provider composition

### 2. ALWAYS Use Centralized Mock Data
```typescript
// ❌ Avoid creating inline mock data
const mockData = { id: 'test', name: 'Test' };

// ✅ Use centralized mock data
import { mockDatasheet, mockFaction, createMockDatasheet } from '@/test/mock-data';

// ✅ Use factory functions for variations
const customDatasheet = createMockDatasheet({ 
  unitComposition: [] // Only override what's needed for test case
});
```

**Exception**: Edge cases may create minimal custom mocks when testing specific scenarios not covered by centralized data.

### 3. Prefer `data-testid` Over Text Queries
```typescript
// ❌ Fragile - breaks if text changes
expect(screen.getByText('Captain')).toBeInTheDocument();

// ✅ Reliable - use data-testid for element selection
const element = screen.getByTestId('unit-composition');
expect(element).toHaveTextContent('Captain');
```

Always use `screen.getByTestId()` instead of `screen.getByText()` or similar text-based queries for more reliable, maintainable tests.

### 4. Import Pattern
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, createMockFaction } from '@/test/mock-data';
import ComponentToTest from './component-to-test';
```

### 5. Make Mock Data Unique
Avoid duplicate values that cause `getByText()` conflicts.

### 6. Mock Complete Interfaces
Always provide full context interfaces when mocking.

## Test Structure Pattern

### Standard Test File Structure
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, createMockDatasheet } from '@/test/mock-data';
import ComponentToTest from './component-to-test';

// Mock child components when needed
vi.mock('./child-component', () => ({
  default: ({ prop }: { prop: any }) => (
    <div data-testid="mocked-child">{prop}</div>
  )
}));

describe('ComponentToTest', () => {
  it('renders with centralized mock data', () => {
    render(<ComponentToTest datasheet={mockDatasheet} />, { wrapper: TestWrapper });
    
    expect(screen.getByTestId('component-root')).toBeInTheDocument();
  });
  
  it('handles edge case with custom mock', () => {
    const edgeCaseData = createMockDatasheet({ abilities: [] });
    render(<ComponentToTest datasheet={edgeCaseData} />, { wrapper: TestWrapper });
    
    expect(screen.queryByTestId('abilities')).not.toBeInTheDocument();
  });
});
```

## Common Problems & Solutions

**Text collisions**: Use `getByRole('heading')` or `getByTestId()` instead of `getByText()`

**Provider errors**: Always use centralized `TestWrapper` - never create custom wrappers

**React Router warnings**: TestWrapper includes v7 future flags to eliminate warnings

**Mock data inconsistencies**: Use centralized mock data from `@/test/mock-data` - avoid inline mocks

**Custom wrapper temptation**: Don't create local TestWrapper definitions - import from `@/test/test-utils`

## Benefits of This Approach

### Centralized TestWrapper
- **Consistency**: All tests use the same provider setup
- **Maintenance**: Changes to providers only need updating in one place
- **Clean Output**: No React Router v7 warnings in test output
- **Complete Context**: Includes Layout, Toast, and Router contexts

### Centralized Mock Data
- **Reusability**: Same mock data works across multiple test files
- **Consistency**: All tests work with the same data structure
- **Type Safety**: Factory functions ensure proper TypeScript interfaces
- **Maintainability**: Updates to data structure only need changing in one place

## Related Documentation
- Testing patterns: `src/pages/CLAUDE.md` 
- Context testing: `src/contexts/CLAUDE.md`