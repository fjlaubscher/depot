# Test Infrastructure Guidelines

Centralized testing utilities for consistent, reliable testing across the application.

## Files
- `mock-data.ts` - Reusable mock data with factory functions
- `test-utils.tsx` - Common test wrappers and utilities

## Key Testing Rules

### 1. Use `data-testid` Over Text Queries
```typescript
// ❌ Fragile
expect(screen.getByText('Captain')).toBeInTheDocument();

// ✅ Reliable
const element = screen.getByTestId('unit-composition');
expect(element).toHaveTextContent('Captain');
```

### 2. Import Centralized Utilities
```typescript
import { TestWrapper, createMockDatasheet } from '@/test/test-utils';
import { mockFaction } from '@/test/mock-data';
```

### 3. Use TestWrapper for All Component Tests
```typescript
render(<Component />, { wrapper: TestWrapper });
```

### 4. Make Mock Data Unique
Avoid duplicate values that cause `getByText()` conflicts.

### 5. Mock Complete Interfaces
Always provide full context interfaces when mocking.

## Common Problems & Solutions

**Text collisions**: Use `getByRole('heading')` or `getByTestId()` instead of `getByText()`

**Provider errors**: Use centralized `TestWrapper` which includes all required providers

**React Router warnings**: TestWrapper includes future flags to eliminate v7 warnings

## Related Documentation
- Testing patterns: `src/pages/CLAUDE.md` 
- Context testing: `src/contexts/CLAUDE.md`