# Routes

Route-aligned React views with colocated tests, `_components`, and `_utils`. Routing is powered by React Router v7 (data routers) with the future flags enabled in `TestWrapper`, so match the component conventions below.

## Available Routes

- `/` → `home`
- `/factions` → `factions`
- `/faction/:factionSlug` → `factions/[factionSlug]`
- `/faction/:factionSlug/datasheet/:datasheetSlug` → `factions/[factionSlug]/datasheet/[datasheetSlug]`
- `/rosters` → `rosters`
- `/rosters/create` → `rosters/create`
- `/rosters/:rosterId` → `rosters/[rosterId]`
- `/rosters/:rosterId/edit` → `rosters/[rosterId]/edit`
- `/rosters/:rosterId/add-units` → `rosters/[rosterId]/add-units`
- `/rosters/:rosterId/units/:unitId/edit` → `rosters/[rosterId]/units/[unitId]/edit`
- `/settings` → `settings`
- `/about` → `about`
- `/privacy` → `privacy`
- `*` → `not-found`

## Structure Pattern

```
routes/
├── route-name/
│   ├── index.tsx              # Main route component
│   ├── index.test.tsx         # Route-level tests
│   ├── _components/           # Route-specific components
│   └── _utils/                # Route utilities (optional)
└── rosters/
    └── [rosterId]/
        ├── index.tsx
        ├── index.test.tsx
        ├── _components/
        ├── add-units/
        ├── edit/
        └── units/[unitId]/edit/
```

## Implementation

### Main Route Component
- Route handling and context integration
- State orchestration with minimal logic
- Composition of child components
- Prefer consuming shared Tailwind utilities (`text-foreground`, `text-muted`, status tokens like `surface-info`, `border-warning`, `focus-ring-primary`) when styling route-level components to keep visuals consistent with the UI library.
- Keep hero/primary actions inside the route root (see `home` for example) and push complex UI into `_components/`.
- Co-locate Graph/test IDs (e.g., `data-testid="browse-factions-button"`) so tests can assert layout-critical items without brittle text matching.

### `_components` Directory
- Single responsibility
- Page-specific functionality
- Clear TypeScript interfaces
- Prefer re-exporting from an `index.ts` inside `_components/` when multiple elements are shared between subroutes.

### `_utils` Directory
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

When adding a new route or drastically changing layout, update `index.test.tsx` alongside the code so vitest catches regressions (e.g., hero CTAs, quick actions, empty states). Use `screen.getByTestId` selectors over text when possible.
