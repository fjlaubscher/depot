# Contexts

React contexts using consistent modular pattern for state management.

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
└── roster/               # Roster building state
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
- Immutable updates

### `context.tsx`
- React context creation
- Provider component with useReducer
### `use-[context-name]-context.ts`
- Custom hook for consuming context
- Type-safe access with validation
- Error if used outside provider

## Active Contexts

### App Context
- Global application data
- Faction loading and caching
- User settings (IndexedDB)
- Offline-first data management

### Layout Context
- Sidebar state
- Responsive behavior
- UI interactions

### Toast Context
- Notification system
- Multiple toast types
- Auto-dismiss functionality

### Roster Context
- Roster building state
- Unit selection
- Point calculations

## Usage

```typescript
// Provider in app root
<AppProvider>
  <LayoutProvider>
    <App />
  </LayoutProvider>
</AppProvider>

// Consumer in components
const { factions, loadFaction } = useAppContext();
const { showToast } = useToastContext();
```