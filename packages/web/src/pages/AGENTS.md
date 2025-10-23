# Pages

React page components with consistent architecture patterns.

## Available Pages

- `add-roster-units`: Add units to a roster
- `create-roster`: Create a new roster
- `datasheet`: View a unit's datasheet
- `edit-roster`: Edit a roster
- `edit-roster-unit`: Edit a unit in a roster
- `faction`: View a faction's details
- `factions`: View all factions
- `home`: Home page
- `not-found`: 404 page
- `rosters`: View all rosters
- `settings`: View and edit user settings
- `view-roster`: View a roster

## Structure Pattern

```
pages/
├── [page-name]/
│   ├── index.tsx              # Main page component
│   ├── index.test.tsx         # Page tests
│   ├── components/            # Page-specific components
│   └── utils/                 # Page utilities
```

## Implementation

### Main Page Component
- Route handling and context integration
- State orchestration with minimal logic
- Composition of child components

### Child Components
- Single responsibility
- Page-specific functionality
- Clear TypeScript interfaces

### Utility Functions
- Pure business logic in `utils/`
- Filtering, grouping, calculations
- Fully testable functions

## State Patterns

- **Loading**: Skeleton components
- **Error**: Recovery options
- **Empty**: Meaningful empty states

## Data Patterns

### Context Integration
```typescript
const { state, getFaction, updateMyFactions } = useAppContext();
const { showToast } = useToastContext();
```

### State Management
- Local state for UI interactions
- Context for global data
- Debounced search inputs

## Performance

- **Memoization**: Filter/grouping operations
- **Debouncing**: Search (300ms), filters (100ms)
- **Skeleton Loading**: Content structure mirrors

## Testing

Use centralized utilities from `src/test/`:
- **TestWrapper**: Required for all tests
- **Mock Data**: Factory functions
- Comprehensive coverage patterns
