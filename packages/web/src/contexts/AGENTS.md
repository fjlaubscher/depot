# Contexts

React contexts using a consistent modular pattern for state management. Each folder encapsulates actions, reducer, provider, and consumer hook.

## Structure

Each context follows this pattern:

```
contexts/
├── app/                    # Global application state
│   ├── constants.ts        # Action type constants
│   ├── types.ts           # TypeScript definitions
│   ├── reducer.ts         # State reducer
│   ├── context.tsx        # Provider component
│   └── use-app-context.ts # Consumer hook
├── layout/                # UI layout state
├── toast/                 # Notification system
└── roster/                # Roster building state
```

## File Pattern

### `constants.ts`
```typescript
export const ACTIONS = {
  SET_DATA: 'SET_DATA',
  CLEAR_DATA: 'CLEAR_DATA'
} as const;
```

### `types.ts`
- State interfaces
- Action type unions
- Context interface

### `reducer.ts`
- Reducer function with actions
- Initial state
- Immutable updates (immer is not used; rely on object spread)

### `context.tsx`
- React context creation
- Provider component with `useReducer`
- Handles async bootstrapping (App context hydrates IndexedDB + data versioning)

### `use-[context-name]-context.ts`
- Custom hook for consuming context
- Type-safe access with validation
- Throws if used outside provider (guards against missing wrapper)

## Active Contexts

### App Context
- Global application data
- Faction loading and caching
- User settings (IndexedDB)
- Offline-first data management
- Data version invalidation + cache clearing

### Layout Context
- Sidebar state
- Responsive behavior
- UI interactions

### Toast Context
- Notification system
- Multiple toast types
- Auto-dismiss functionality
- Respects reduced motion preferences

### Roster Context
- Roster building state
- Unit selection
- Point calculations
- Core stratagem + enhancement lookups

## Usage

```typescript
// Provider in app root
<AppProvider>
  <LayoutProvider>
    <RosterProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </RosterProvider>
  </LayoutProvider>
</AppProvider>

// Consumer in components
const { state, getFaction } = useAppContext();
const { showToast } = useToastContext();
const { state: roster, addUnit } = useRoster();
```

## Testing
- `TestWrapper` (`src/test/test-utils.tsx`) wires up all providers—always use it for component tests.
- When unit testing reducers, import from the specific folder (`contexts/app/reducer`) and cover edge cases with Vitest table-driven tests.
