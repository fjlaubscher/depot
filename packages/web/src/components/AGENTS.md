# Components

Component library organized by reusability and domain specificity.

## Directory Structure

### `ui/` - Base UI Components
Fundamental building blocks with no business logic:
- Built with Tailwind CSS
- Dark mode support
- Accessible by default
- TypeScript interfaces
- **Exported via**: `@/components/ui` index file

Key components: `Button`, `Card`, `Alert`, `Table`, `Toast`, `Layout`, `Search`, `Filters`, `Tag`, `SelectField`, `QuantityStepper`, `CollapsibleSection`, `ContentCard`, `DashboardCard`, `ErrorState`, `Field`, `Grid`, `IconButton`, `LinkCard`, `Loader`, `PageHeader`, `PointsTag`, `Skeleton`, `StatCard`, `StatsRow`, `Tabs`, `ToastContainer`, `ToggleSwitch`.

### `shared/` - Domain Components
Reusable components with depot-specific logic:
- Accept `depot.*` types as props
- Contain domain rendering logic
- Reusable across pages

Examples: `AbilityModal`, `ModelStatsRow`, `StratagemCard`, `BackButton`, `Datasheet`, `ErrorBoundary`, `Roster`, `WargearRow`, `WargearSelection`, `WargearTable`.

### `shared/roster/` - Roster Components
Roster-specific components for building/editing:
- Handle `depot.Roster` and `depot.RosterUnit` types
- Shared between roster pages
- Complex roster business logic

### `layout/` - Layout Components
Main application layout structure

### `logo/` - Brand Components
Depot branding and logo assets

## File Naming
- **kebab-case** for directories and files
- **PascalCase** for component exports
- Optional `.test.tsx` for unit tests

## Props Pattern

```typescript
interface ComponentProps {
  // Required props first
  data: depot.SomeType;
  onAction: (id: string) => void;

  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}
```

## Export Patterns

### UI Components
```typescript
// ui/index.ts
export { default as Button } from './button';
```

### Shared Components
```typescript
import { Datasheet } from '@/components/shared/datasheet';
import { Roster } from '@/components/shared/roster';
```
