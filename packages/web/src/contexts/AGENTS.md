# Contexts

Each context lives in one folder with a `context.tsx` that exports the provider **and** its consumer hook (which throws outside the provider). Only add extra files (`types.ts`, `reducer.ts`, `constants.ts`) when the reducer is big enough to test on its own.

## Active Contexts
- **Factions** (`factions/`) - faction index, data versioning, offline cache + data helpers (`useFactionsContext`); reducer + index sync split out and unit-tested
- **Settings** (`settings/`) - user preferences with IndexedDB persistence (`useSettingsContext`); toggles the `hide-fluff` root class
- **Layout** (`layout/`) - sidebar state (`useLayoutContext`)
- **Toast** (`toast/`) - `useState<Toast[]>` + 3s auto-dismiss (`useToast`)
- **Roster** (`roster/`) - roster building state (`useRoster`); `reducer.ts` also exports `normalizeUnit`, reused by `data/offline-storage.ts`

`app-provider.tsx` composes Factions → Settings → Toast → Layout. `RosterProvider` is mounted separately (it needs Toast).

## Usage
```tsx
<AppProvider>
  <RosterProvider>
    <App />
  </RosterProvider>
</AppProvider>

const { getFactionManifest, getDatasheet } = useFactionsContext();
const { settings } = useSettingsContext();
const { showToast } = useToast();
const { state: roster, addUnit } = useRoster();
```

## Testing
- Wrap general UI tests with `TestWrapper` (`src/test/test-utils.tsx`) = MemoryRouter + `AppProvider`; add `RosterProvider` explicitly for roster flows.
- Reducer unit tests import from the specific folder and cover edge cases with table-driven Vitest tests.
- To stub a hook that shares a file with its provider, use `vi.mock('@/contexts/toast/context', { spy: true })` so the provider keeps working.
