# Context Architecture Pattern

This directory contains React contexts organized using a consistent pattern for state management across the application.

## Directory Structure

Each context follows this modular file structure:

```
contexts/
├── app/                    # Main application data context
│   ├── constants.ts        # Action type constants
│   ├── types.ts           # TypeScript type definitions
│   ├── reducer.ts         # State reducer logic
│   ├── context.tsx        # Context provider component
│   └── use-app-context.ts # Custom hook for consuming context
├── layout/                # UI layout state context
│   ├── constants.ts
│   ├── types.ts
│   ├── reducer.ts
│   ├── context.tsx
│   └── use-layout-context.ts
└── CLAUDE.md             # This documentation file
```

## File Responsibilities

### `constants.ts`
Defines action type constants using a frozen object pattern:
```typescript
export const CONTEXT_ACTIONS = {
  ACTION_NAME: 'ACTION_NAME',
  ANOTHER_ACTION: 'ANOTHER_ACTION'
} as const;
```

### `types.ts`
Contains all TypeScript type definitions for:
- State interface
- Action type unions
- Context interface with methods

### `reducer.ts`
Exports the reducer function and initial state:
- Uses the action constants from `constants.ts`
- Implements immutable state updates
- Provides type safety with TypeScript

### `context.tsx`
Contains the React context and provider component:
- Creates the context with `createContext`
- Implements the provider component with `useReducer`
- Includes any side effects (data fetching, etc.)
- Provides action creator helper functions

### `use-[context-name]-context.ts`
Custom hook for consuming the context:
- Validates context is used within a provider
- Provides type-safe access to context value
- Throws meaningful error if used outside provider

## Context Types

### App Context (`contexts/app/`)
Manages global application data and business logic with offline-first approach:
- Faction index loading and caching (IndexedDB first, network fallback)
- Individual faction data with automatic IndexedDB caching
- User settings persistence in IndexedDB
- Offline faction list for settings page management
- Error states and loading states
- Methods: `loadFaction()`, `updateSettings()`, `clearOfflineData()`

### Layout Context (`contexts/layout/`)
Manages UI layout state:
- Sidebar open/closed state
- Responsive behavior helpers
- Layout-specific UI interactions

### Toast Context (`contexts/toast/`)
Manages notification system:
- Toast display with auto-dismiss
- Multiple toast types (success, error, warning, info)
- Toast queue management
- Integration with offline operations

## Usage Pattern

### 1. Provider Setup
Wrap your app with the context providers:
```tsx
import { AppProvider } from './contexts/app/context';
import { LayoutProvider } from './contexts/layout/context';

function App() {
  return (
    <AppProvider>
      <LayoutProvider>
        <YourAppComponents />
      </LayoutProvider>
    </AppProvider>
  );
}
```

### 2. Consuming Context
Use the custom hooks in components:
```tsx
import { useAppContext } from '@/contexts/app/use-app-context';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';

function MyComponent() {
  const { state, dispatch, loadFaction } = useAppContext();
  const { toggleSidebar, closeSidebar } = useLayoutContext();
  
  // Use state and actions...
}
```

## Offline Storage Integration

### IndexedDB Integration (`data/offline-storage.ts`)
The App Context integrates with a modern IndexedDB wrapper for offline-first data management:

```typescript
// Automatic faction caching when loading
const cachedFaction = await offlineStorage.getFaction(id);
if (cachedFaction) {
  // Use cached data immediately
  dispatch({ type: APP_ACTIONS.LOAD_FACTION_SUCCESS, payload: { id, faction: cachedFaction } });
  return;
}

// Network fallback with automatic caching
const response = await fetch(`/data/${id}.json`);
const faction = await response.json();
await offlineStorage.setFaction(id, faction); // Auto-cache for offline use
```

### Key Features
- **Offline-First**: Always check IndexedDB before network requests
- **Automatic Caching**: Network-loaded data is automatically cached
- **Settings Persistence**: User preferences saved to IndexedDB
- **Error Recovery**: Network failures don't break app if data is cached
- **Cache Management**: Settings page can view and clear cached data

### Storage Structure
- **Faction Index**: `/data/index.json` cached for offline navigation
- **Individual Factions**: Cached as visited for detailed browsing
- **User Settings**: Forge World/Legends preferences persist across sessions

## Benefits of This Pattern

### Modularity
- Each context is self-contained
- Easy to add, remove, or modify contexts
- Clear separation of concerns

### Offline Capability
- True offline-first data loading
- Automatic caching without user intervention
- Graceful fallback between IndexedDB and network

### Type Safety
- Full TypeScript support
- Compile-time error checking
- IntelliSense support

### Consistency
- Predictable file structure
- Standard naming conventions
- Uniform API patterns

### Maintainability
- Easy to locate context-related code
- Clear separation between UI state and business logic
- Testable reducer functions

## Best Practices

### Context Scope
- Keep contexts focused on specific domains
- App context: global data and business logic
- Layout context: UI-specific state
- Consider creating additional contexts for distinct feature areas

### Action Design
- Use descriptive action type names
- Include payload data when needed
- Keep actions focused and atomic

### Provider Placement
- Place providers at the appropriate level in component tree
- App context: typically at root level
- Layout context: often at root or layout component level
- Feature contexts: closer to where they're needed

### Performance Considerations
- Split contexts by update frequency
- Use React.memo() for components when needed
- Consider using multiple contexts instead of one large context

## Testing Patterns

### Test Wrapper Setup
When testing components that use contexts, create comprehensive test wrappers:

```tsx
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      <LayoutProvider>
        {children}
      </LayoutProvider>
    </ToastProvider>
  </BrowserRouter>
);
```

### Provider Order
- **Router providers** (BrowserRouter) should be outermost
- **Data contexts** (ToastProvider) should wrap UI contexts
- **UI contexts** (LayoutProvider) should be innermost
- This ensures proper context availability and prevents provider conflicts

### Mock Context Values
When mocking contexts, provide complete context shape:

```tsx
mockUseToastContext.mockReturnValue({
  showToast: mockShowToast,
  removeToast: vi.fn(),
  clearAllToasts: vi.fn(),
  state: { toasts: [] },
  dispatch: vi.fn()
});
```

### Test Infrastructure Lessons
- **Provider Nesting**: All contexts used by components must be present in test wrappers
- **Mock Completeness**: Partial mocks can cause runtime errors - provide full context interfaces
- **Async Operations**: Use proper async/await patterns in test setup (beforeEach blocks)
- **Context Validation**: Tests will fail fast if context providers are missing, making debugging easier