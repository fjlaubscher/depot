# Components

Component library organized by reusability and domain specificity. Components lean on Tailwind utility tokens defined in `src/styles/main.css` (e.g., `text-foreground`, `surface-card`, `focus-ring-*`, status palettes).

## Directory Structure
- `ui/` - Base UI primitives with no business logic (buttons, cards, alerts, layout, search, filters, tags, select, steppers, collapsible sections, dashboards, loaders, page headers, skeletons, tabs, etc.). Exported via `@/components/ui`.
- `shared/` - Domain-aware components that accept `depot.*` types (e.g., `AbilitySheet`, `Datasheet`, `StratagemCard`, `Roster`, wargear components, error boundaries).
- `shared/roster/` - Roster-focused components for building/editing units and lists.
- `layout/` — Core application layout components.
- `logo/` — Branding assets.

## Styling Guidance
- Prefer shared utilities from `src/styles/main.css` over raw Tailwind colors.
- Use flex/grid `gap` for spacing instead of margins wherever possible. Stick to `gap-0.5`, `gap-1`, `gap-2`, `gap-4` (rarely `gap-6`); the same scale applies to padding.
- When a visual pattern repeats, promote it to an `@utility` entry so JSX stays terse and consistent.

## File Naming
- kebab-case filenames/directories, PascalCase exports
- Optional `.test.tsx` for behavioral components; pure presentational pieces can rely on route-level integration tests

## Props Pattern
```typescript
interface ComponentProps {
  // Required first
  data: depot.SomeType;
  onAction: (id: string) => void;

  // Optional with defaults
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}
```

## Export Patterns
- UI: re-export via `ui/index.ts`
- Shared: import directly (`import { Datasheet } from '@/components/shared/datasheet'`)

## Testing Guidelines
- UI primitives with behavior (search, filters, steppers, complex cards) should have focused tests.
- Domain components with logic (datasheet/roster cards) need colocated tests covering props handling and edge cases.

## Roster Components
- `RosterUnitCardCompact` is the visual source of truth for roster/collection unit cards (header, points, wargear summary, footer state tag). Prefer composing it rather than duplicating layouts.
- `RosterUnitProfilePanel` renders the detailed unit profile (stats, composition, abilities, selected wargear) in the surface-muted panel treatment used for expanded cards; shared between roster view and collections.
- `LibraryCard` (`shared/library-card.tsx`) is the grid card for the roster and collection libraries; `PillTabs` (`shared/pill-tabs.tsx`) is the rounded filter-pill row with counts.

## Rich Text / Wahapedia HTML
- Use the `.ability-rich-text` wrapper for any Wahapedia-derived HTML (detachment abilities, modal ability text, doctrine tables) so tables, headings, fluff text, and keyword spans are styled consistently in light and dark mode.
