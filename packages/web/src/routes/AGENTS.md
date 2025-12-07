# Routes

Route-aligned React views with colocated tests, `_components`, and `_utils`. Routing uses React Router v7 (data routers) with future flags enabled in `TestWrapper`.

## Available Routes
- `/` -> `home`
- `/factions` -> `factions`
- `/faction/:factionSlug` -> `factions/[factionSlug]`
- `/faction/:factionSlug/datasheet/:datasheetSlug` -> `factions/[factionSlug]/datasheet/[datasheetSlug]`
- `/rosters` -> `rosters`
- `/rosters/create` -> `rosters/create`
- `/rosters/:rosterId` -> `rosters/[rosterId]`
- `/rosters/:rosterId/edit` -> `rosters/[rosterId]/edit`
- `/rosters/:rosterId/add-units` -> `rosters/[rosterId]/add-units`
- `/rosters/:rosterId/units/:unitId/edit` -> `rosters/[rosterId]/units/[unitId]/edit`
- `/settings`, `/about`, `/privacy`, `/not-found` (`*`)

## Structure Pattern
- `route-name/index.tsx` - main route component
- `route-name/index.test.tsx` - route-level tests
- `route-name/_components/` - route-specific components
- `route-name/_utils/` - route utilities (optional)
- Nested routes follow folder nesting under `rosters/` for roster-specific flows

## Implementation Notes
- Keep the main route component focused on orchestration; push display/logic into `_components/`.
- Use shared Tailwind utilities (`text-foreground`, `text-muted`, status surfaces/borders, `focus-ring-*`) to align with the design system.
- Prefer flex/grid `gap` over margins for spacing; stick to `gap-0.5`, `gap-1`, `gap-2`, `gap-4` (rarely `gap-6`) and the same scale for padding.
- Keep hero/primary actions inside the route root and expose stable `data-testid` hooks for layout-critical elements.
 - For roster + collections unit views, prefer composing shared roster components (`RosterUnitCardCompact`, `RosterUnitProfilePanel`, `RosterUnitList`) rather than duplicating layout/expansion logic in route-level `_components`.

## State & Data Patterns
- Context integration: `useSettings`, `useFactionIndex`/`useFactionData`, `useToastContext`, `useRoster`.
- Loading states use skeletons mirroring the final layout; errors provide recovery actions; empty states should be meaningful.
- Memoize heavy filtering/grouping and debounce search inputs (300ms search, ~100ms filters) to keep routes responsive.

## Testing
- Use `TestWrapper` from `src/test/test-utils.tsx` for all route tests (Router + providers).
- Favor `data-testid` selectors over text matching for layout assertions.
- When adding/changing routes, update the colocated `index.test.tsx` to lock in hero CTAs, quick actions, and empty states.
