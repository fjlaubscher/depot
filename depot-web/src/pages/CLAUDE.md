# Pages Architecture Guidelines

This directory contains React page components organized using a consistent, scalable pattern for maintainability and clarity.

## Directory Structure

Each page follows this modular file structure:

```
pages/
├── [page-name]/
│   ├── index.tsx              # Main page component
│   ├── index.test.tsx         # Main page component tests
│   ├── components/            # Page-specific components
│   │   ├── component-a.tsx    # Focused, single-purpose components
│   │   ├── component-a.test.tsx # Tests colocated with components
│   │   ├── component-b.tsx    # Each handling specific UI concerns
│   │   ├── component-b.test.tsx # No barrel files - explicit imports
│   │   └── component-c.tsx    
│   ├── utils/                 # Page-specific utilities and helpers
│   │   ├── helper-functions.ts # Business logic extracted from components
│   │   └── helper-functions.test.ts # Utility function tests
└── CLAUDE.md                  # This documentation file
```

## File Organization Principles

### Main Page Component (`index.tsx`)
- **Single Responsibility**: Orchestrates child components and manages top-level state
- **Minimal Logic**: Delegates complex logic to utils and UI concerns to child components
- **Explicit Imports**: Import components and utilities directly, no barrel files
- **State Management**: Uses context hooks, custom hooks, and local state appropriately
- **Error Boundaries**: Handles loading, error, and success states

### Child Components (`components/`)
- **Focused Scope**: Each component handles one specific UI concern or user interaction
- **Clear Naming**: Component names should clearly indicate their purpose
- **Prop Interfaces**: Well-defined TypeScript interfaces for all props
- **Composable**: Can be combined to build complex UI while remaining testable
- **No Barrel Files**: Import components explicitly to maintain clarity

### Utility Functions (`utils/`)
- **Pure Functions**: Extract business logic, calculations, and data transformations
- **Single File per Domain**: Group related functions by domain (e.g., `faction.ts`, `search.ts`)
- **Export Named Functions**: Use named exports for better tree-shaking and clarity
- **Type Definitions**: Co-locate interfaces and types with their related functions
- **No Side Effects**: Keep functions pure and predictable

### Test Files (`*.test.tsx` / `*.test.ts`)
- **Colocated**: Tests live next to the files they test
- **Comprehensive**: Cover component rendering, user interactions, and edge cases
- **Pure Function Tests**: Test utility functions with various inputs and outputs
- **Integration Tests**: Test component combinations and data flow between components

## Example Implementation: Home Page

The `home-new/` directory demonstrates these principles:

### Main Component Structure
```typescript
// home-new/index.tsx
const HomeNew: React.FC = () => {
  const { state } = useAppContext();
  const [query, setQuery] = useState('');
  
  // Extract complex logic to utils
  const filteredFactions = useMemo(() => 
    filterFactionsByQuery(state.factionIndex, debouncedQuery),
    [state.factionIndex, debouncedQuery]
  );

  // Delegate UI concerns to child components
  if (state.loading) return <LoadingSkeleton />;
  if (state.error) return <ErrorState error={state.error} />;

  return (
    <Layout title="Home">
      <Tabs>
        <FavouritesTab favourites={myFactions} />
        <AllFactionsTab {...tabProps} />
      </Tabs>
    </Layout>
  );
};
```

### Component Breakdown
- **LoadingSkeleton**: Handles loading state UI with skeleton cards
- **ErrorState**: Displays error messages with user-friendly formatting
- **NoResults**: Shows empty state when search yields no results
- **FavouritesTab**: Manages favourite factions display (conditional rendering)
- **AllFactionsTab**: Handles search and faction browsing with conditional content
- **FactionGrid**: Renders faction cards in responsive grid with loading skeletons
- **FactionCard**: Individual faction link cards with consistent styling
- **AllianceSection**: Groups factions by alliance with section headers
- **SearchFilters**: Search input and clear functionality with conditional clear button

### Utility Functions
```typescript
// home-new/utils/faction.ts
export interface GroupedFactions {
  [key: string]: depot.Index[];
}

export const filterFactionsByQuery = (
  factions: depot.Index[] | null, 
  query: string
): depot.Index[] => {
  // Pure function for search filtering with null safety
};

export const groupFactionsByAlliance = (
  factions: depot.Index[]
): GroupedFactions => {
  // Groups factions by alliance and sorts alphabetically
};

export const createTabLabels = (hasMyFactions: boolean): string[] => {
  // Dynamically creates tab labels based on user preferences
};

export const hasFavourites = (myFactions: depot.Index[] | undefined): boolean => {
  // Safe check for favourites with null/undefined handling
};
```

## Development Guidelines

### Component Design
1. **Single Purpose**: Each component should have one clear responsibility
2. **Prop Drilling**: Prefer explicit prop passing over complex context usage
3. **Composition**: Build complex UI through component composition
4. **State Location**: Keep state as close to where it's used as possible
5. **Loading States**: Always handle loading, error, and empty states

### Code Organization
1. **Explicit Imports**: Always import specific functions/components, avoid barrel files
2. **Consistent Naming**: Use descriptive, consistent naming conventions
3. **Type Safety**: Leverage TypeScript for all props, state, and function parameters
4. **Extract Logic**: Move complex logic to utility functions for testability
5. **Co-location**: Keep related files close together in the directory structure

### State Management
1. **Context Usage**: Use app context for global state, local state for UI concerns
2. **Custom Hooks**: Extract reusable stateful logic into custom hooks
3. **Memoization**: Use useMemo and useCallback for expensive operations
4. **State Updates**: Keep state updates predictable and well-typed

### Testing Strategy
1. **Colocated Tests**: Place `*.test.tsx` and `*.test.ts` files next to source files
2. **Component Tests**: Test user interactions, prop handling, and conditional rendering
3. **Utility Tests**: Test business logic functions with various inputs and edge cases
4. **Integration Tests**: Test component combinations and data flow
5. **Mock Strategy**: Mock external dependencies (context, API calls, routing)

#### Test Categories by Component Type
- **State Components**: Focus on conditional rendering (loading, error, success states)
- **Interaction Components**: Test user events (clicks, typing, form submissions)
- **Data Components**: Test prop handling, data transformations, and edge cases
- **Utility Functions**: Test pure functions with comprehensive input/output scenarios

## Best Practices

### Performance
- Extract expensive calculations to utility functions with memoization
- Split loading states into separate components
- Use skeleton loaders for better perceived performance
- Minimize re-renders through proper dependency arrays
- Debounce user inputs for search functionality
- Use useMemo for complex data transformations (filtering, grouping)

### Maintainability
- Keep components small and focused
- Use consistent file and component naming
- Document complex business logic in utility functions
- Prefer composition over inheritance

### Accessibility
- Include proper ARIA labels and semantic HTML
- Handle keyboard navigation
- Provide meaningful error messages
- Support screen readers with descriptive text

### Error Handling
- Create dedicated error state components
- Handle loading states gracefully
- Provide user-friendly error messages
- Implement proper fallback UI

## Migration from Legacy Code

When rebuilding existing pages:

1. **Extract State Logic**: Move complex useMemo/useCallback logic to utility functions
2. **Component Separation**: Break large components into focused child components
3. **UI Library Migration**: Replace old components with new UI library components
4. **Context Migration**: Replace deprecated state management with new context system
5. **Testing Addition**: Add comprehensive tests for new component structure

## Advanced Patterns Discovered

### Conditional Component Rendering
Create dedicated components for different states instead of inline conditionals:
```typescript
// ❌ Avoid inline conditionals in main component
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

// ✅ Use dedicated state components
if (loading) return <LoadingSkeleton />;
if (error) return <ErrorState error={error} />;
```

### Skeleton Loading Pattern  
Provide skeleton components that mirror actual content structure:
```typescript
// FactionGrid component with loading prop
const FactionGrid = ({ factions, loading }) => {
  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </Grid>
    );
  }
  // ... actual content
};
```

### Comprehensive Test Mocking
Mock child components to focus on integration logic:
```typescript
// Mock complex child components in integration tests
vi.mock('./components/alliance-section', () => ({
  default: ({ alliance, factions }) => (
    <div data-testid={`alliance-${alliance}`}>
      {factions.map(f => <div key={f.id}>{f.name}</div>)}
    </div>
  )
}));
```

### Edge Case Handling in Utils
Always handle null/undefined cases in utility functions:
```typescript
export const filterFactionsByQuery = (
  factions: depot.Index[] | null, 
  query: string
): depot.Index[] => {
  if (!factions) return []; // Handle null/undefined
  if (!query) return factions; // Handle empty query
  // ... filtering logic
};
```

### Test Organization by Interaction Type
Structure tests by interaction patterns:
- **Loading/Error States**: Test conditional rendering
- **User Interactions**: Test clicks, typing, navigation  
- **Data Flow**: Test prop passing and state updates
- **Edge Cases**: Test null values, empty arrays, error scenarios

This pattern promotes maintainable, testable, and scalable page components that are easy to understand and modify.