# Pages Architecture & Implementation Guide

This directory contains React page components using a consistent, scalable architecture for the depot application.

## Core Architecture Principles

### Directory Structure Pattern
```
pages/
├── [page-name]/
│   ├── index.tsx              # Main page component
│   ├── index.test.tsx         # Page component tests
│   ├── components/            # Page-specific components
│   └── utils/                 # Page-specific utilities
```

### Component Responsibilities
- **Main Page Component**: State orchestration, context integration, route handling, minimal logic
- **Child Components**: Single responsibility, composable design, clear TypeScript interfaces
- **Utility Functions**: Pure business logic, domain organization, fully testable

## Implementation Patterns

### Context-Based Data Loading
Pages use App Context hooks for data management. See `home/index.tsx` and `faction/index.tsx` for examples.

### State Component Pattern
Use dedicated components for different states:
- Loading: Skeleton components that mirror content structure
- Error: User-friendly error messages with recovery options
- Empty: Meaningful empty states for filtered views

### Utility Function Extraction
Extract complex filtering, grouping, and calculation logic to `utils/` directory. Examples:
- `home/utils/faction.ts` - Faction filtering and alliance grouping
- `faction/utils/detachment.ts` - Detachment ability filtering and organization
- `faction/utils/enhancement.ts` - Enhancement processing with cost handling

## Card Component Design System

### Consistent Structure
All domain cards follow standardized layout patterns. Reference implementations:
- `faction/components/stratagem-card.tsx` - CP cost badges, type classification
- `faction/components/detachment-ability-card.tsx` - Detachment badges, descriptions
- `faction/components/enhancement-card.tsx` - Cost + detachment badge combinations

## Tab Component Architecture

### Standardized Tab Pattern
All tab components follow consistent structure:
1. Local state management with debounced search
2. Memoized filtering and grouping operations
3. UI state calculations (empty checks)
4. Consistent filter UI with clear functionality
5. Grouped display with proper empty states

See `faction/components/` directory for complete implementations.

## Performance Optimization

### Memoization Strategy
- Filter operations: Memoize with proper dependency arrays
- Grouping operations: Separate memoization from filtering
- UI state: Memoize empty checks separately from data operations

### Debouncing
- Search inputs: 300ms debounce
- Filter inputs: 100ms debounce

## Testing Strategy

### Test Infrastructure
Use centralized testing utilities from `src/test/`:
- **TestWrapper**: Required for all component tests (includes Router, Layout, Toast contexts)
- **Mock Data**: Use factory functions from `mock-data.ts`

See `src/test/CLAUDE.md` for comprehensive testing guidelines.

### Test Coverage Categories
1. **Main Component Tests**: Loading, error, success states, user interactions
2. **Utility Function Tests**: Pure functions with edge cases and various inputs
3. **Integration Tests**: Component combinations and data flow
4. **Component-Specific Tests**: Mock child components, focus on integration logic

### Test Organization
Structure tests by interaction patterns: Loading/Error States, User Interactions, Data Display, Edge Cases.

## Key Implementation Examples

### Current Implementations
- **Home Page** (`home/`): Complete modular architecture with alliance grouping
- **Faction Page** (`faction/`): Advanced tab system with comprehensive filtering
- **Test Infrastructure** (`../test/`): Centralized utilities and mock data

### Reference Files
- Context integration: `home/index.tsx`
- Complex filtering: `faction/utils/detachment.ts`
- Tab patterns: `faction/components/faction-datasheets.tsx`
- Testing patterns: All `*.test.tsx` files

## Best Practices

### Code Organization
- Single responsibility components
- Extract logic to testable utilities
- Explicit imports, no barrel files
- Colocated tests

### Performance
- Debounced user inputs
- Proper memoization
- Skeleton loading states
- Minimize re-renders

### User Experience
- Meaningful loading states
- Graceful error handling
- Empty state management
- Keyboard navigation support

### Testing
- Use centralized TestWrapper and mock data
- React 19 act() patterns for interactions
- Mock child components in integration tests
- Cover edge cases and error scenarios

This architecture ensures maintainable, testable, and performant page components across the depot application.