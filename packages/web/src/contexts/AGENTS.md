# Contexts

React contexts follow a consistent modular pattern (actions, reducer, provider, consumer hook). Each folder encapsulates its own types and reducer logic.

## Structure Pattern
- `constants.ts` — action type constants
- `types.ts` — state interfaces, action unions, context shape
- `reducer.ts` — reducer + initial state (immutable updates via object spread)
- `context.tsx` — provider component wiring `useReducer`
- `use-<name>-context.ts` — consumer hook that throws if used outside provider

## Active Contexts
- **Factions** - faction index, data versioning, offline cache + data helpers
- **Settings** - user preferences with IndexedDB persistence
- **Layout** - sidebar + responsive UI state
- **Toast** - notification system with auto-dismiss and reduced-motion respect
- **Roster** - roster building state, unit selection, points calculations

## Usage
```tsx
<AppProvider>
  <ToastProvider>
    <LayoutProvider>
      <RosterProvider>
        <App />
      </RosterProvider>
    </LayoutProvider>
  </ToastProvider>
</AppProvider>

const { getFactionManifest, getDatasheet } = useFactionData();
const { settings } = useSettings();
const { showToast } = useToastContext();
const { state: roster, addUnit } = useRoster();
```

## Testing
- Always wrap general UI tests with `TestWrapper` (`src/test/test-utils.tsx`) to get Router + App, Layout, and Toast providers; add `RosterProvider` explicitly when testing roster-specific flows or reducers that expect it.
- Reducer unit tests should import from the specific folder and cover edge cases with table-driven Vitest tests.
