# Home Page Implementation Guide

This page demonstrates the complete implementation of the modular pages architecture pattern established in `src/pages/CLAUDE.md`.

## Architecture Overview

The home page follows a comprehensive component breakdown strategy with focused, single-purpose components and extensive utility function extraction for business logic.

## Component Structure

### Main Component (`index.tsx`)
```typescript
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

## Child Component Breakdown

### State Management Components
- **LoadingSkeleton**: Handles loading state UI with skeleton cards
- **ErrorState**: Displays error messages with user-friendly formatting
- **NoResults**: Shows empty state when search yields no results

### Content Components  
- **FavouritesTab**: Manages favourite factions display (conditional rendering)
- **AllFactionsTab**: Handles search and faction browsing with conditional content
- **FactionGrid**: Renders faction cards in responsive grid with loading skeletons
- **FactionCard**: Individual faction link cards with consistent styling
- **AllianceSection**: Groups factions by alliance with section headers

### Interaction Components
- **SearchFilters**: Search input and clear functionality with conditional clear button

## Utility Functions (`utils/faction.ts`)

### Type Definitions
```typescript
export interface GroupedFactions {
  [key: string]: depot.Index[];
}
```

### Core Functions
```typescript
export const filterFactionsByQuery = (
  factions: depot.Index[] | null, 
  query: string
): depot.Index[] => {
  // Pure function for search filtering with null safety
  if (!factions) return [];
  if (!query) return factions;
  
  return factions.filter(faction =>
    faction.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const groupFactionsByAlliance = (
  factions: depot.Index[]
): GroupedFactions => {
  // Groups factions by alliance and sorts alphabetically
  const grouped = factions.reduce((acc, faction) => {
    const alliance = getFactionAlliance(faction.id);
    if (!acc[alliance]) acc[alliance] = [];
    acc[alliance].push(faction);
    return acc;
  }, {} as GroupedFactions);

  // Sort within each alliance
  Object.keys(grouped).forEach(key => {
    grouped[key] = sortByName(grouped[key]);
  });

  return grouped;
};

export const createTabLabels = (hasMyFactions: boolean): string[] => {
  // Dynamically creates tab labels based on user preferences
  return hasMyFactions ? ['My Factions', 'All Factions'] : ['All Factions'];
};

export const hasFavourites = (myFactions: depot.Index[] | undefined): boolean => {
  // Safe check for favourites with null/undefined handling
  return Boolean(myFactions && myFactions.length > 0);
};
```

## Key Implementation Patterns

### Skeleton Loading Pattern
The home page uses comprehensive skeleton loading that mirrors the actual content structure:

```typescript
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, allianceIndex) => (
      <div key={`alliance-${allianceIndex}`} className="space-y-4">
        <SkeletonCard className="h-8 w-32" />
        <Grid>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${allianceIndex}-${index}`} />
          ))}
        </Grid>
      </div>
    ))}
  </div>
);
```

### Conditional Tab Rendering
Tabs are dynamically created based on user state:

```typescript
const tabLabels = useMemo(() => 
  createTabLabels(hasFavourites(myFactions)),
  [myFactions]
);

// Only render favourites tab if user has favourites
const validTabs = tabLabels.filter(tab => tab.trim() !== '');
```

### Comprehensive Test Coverage

#### Test Organization (4 test files, 45+ scenarios)
1. **Main Component Tests** (`index.test.tsx`)
   - Loading, error, and success states
   - Tab rendering and switching
   - Search functionality integration

2. **Utility Function Tests** (`utils/faction.test.ts`)  
   - Pure function testing with various inputs
   - Edge cases (null, empty arrays)
   - Business logic validation

3. **Component Integration Tests**
   - Child component data flow
   - User interaction workflows
   - State management integration

4. **Edge Case Testing**
   - Network failures
   - Empty data scenarios
   - Invalid user inputs

## Performance Optimizations

### Debounced Search
Search input uses 300ms debouncing to prevent excessive filtering operations:

```typescript
const debouncedQuery = useDebounce(query, 300);
```

### Memoized Complex Calculations
All expensive operations are memoized:

```typescript
const filteredFactions = useMemo(() => 
  filterFactionsByQuery(state.factionIndex, debouncedQuery),
  [state.factionIndex, debouncedQuery]
);

const groupedFactions = useMemo(() =>
  groupFactionsByAlliance(filteredFactions),
  [filteredFactions]
);
```

## V2 Routing Integration

The home page is accessible through multiple V2 routes for gradual migration:
- `/v2` - Default V2 entry point
- `/v2/home` - Explicit home page route

This allows for safe rollout alongside the legacy home page at `/`.

## Benefits Demonstrated

1. **Maintainability**: Small, focused components are easy to understand and modify
2. **Testability**: Pure utility functions and isolated components enable comprehensive testing
3. **Performance**: Proper memoization and debouncing prevent unnecessary re-renders
4. **User Experience**: Skeleton loading and responsive design provide smooth interactions
5. **Scalability**: Modular architecture supports easy feature additions