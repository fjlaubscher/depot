# Components Architecture

This directory contains the component library for the depot web application, organized into different layers for optimal reusability and maintainability.

## Directory Structure

### `ui/` - Core UI Components
Basic, reusable UI components built with Tailwind CSS. These are fundamental building blocks that can be used across any part of the application.

**Principles:**
- Single responsibility components
- No business logic or data dependencies
- Consistent API design with TypeScript interfaces
- Dark mode support via Tailwind classes
- Accessible by default (ARIA attributes, semantic HTML, keyboard navigation)

### `shared/` - Domain-Specific Shared Components
Reusable components that contain domain-specific logic but can be used across multiple pages or contexts. These components understand depot-specific data types and business rules.

**Principles:**
- Accept depot data types as props
- Contain domain-specific rendering logic
- Reusable across multiple pages
- May have internal state for presentation logic

### `shared/roster/` - Roster-Specific Shared Components
Components specifically related to roster building, editing, and viewing. These components are shared between roster-related pages but not used elsewhere in the app.

**Principles:**
- Understand roster data structures (depot.Roster, depot.RosterUnit, etc.)
- Handle roster-specific interactions and state
- Shared between edit and view modes
- May contain complex roster business logic

### `layout/` - Layout Components
Application layout and navigation components.

## File Structure Conventions

```
component-category/
├── component-name.tsx     # Component implementation
└── component-name.test.tsx # Unit tests (optional)
```

**Note:** Utilities should be placed in `src/utils/` directory, not within component folders.

## Naming Conventions
- **kebab-case** for component directories and files
- **PascalCase** for component names in code
- **camelCase** for props and internal variables
- **kebab-case** for CSS classes and test IDs

## Props Interface Design
```typescript
interface ComponentProps {
  // Required props first
  data: depot.SomeType;
  onAction: (id: string) => void;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Children and render props last
  children?: React.ReactNode;
}
```

## Export Patterns

### UI Components
All UI components exported from `ui/index.ts`:

```typescript
export { default as Button } from './button';
export { default as Card } from './card';
```

### Shared Components
Export individual components directly:

```typescript
import StratagemCard from '@/components/shared/stratagem-card';
import { RosterHeader } from '@/components/shared/roster';
```

### Roster Components
Export from barrel file:

```typescript
// shared/roster/index.ts
export { default as RosterHeader } from './roster-header';
export { default as RosterUnitCard } from './roster-unit-card';
```

## Best Practices

### State Management
- Use local component state for UI-only state
- Pass data and callbacks via props (no direct context usage in shared components)
- Use `useMemo` and `useCallback` for expensive calculations and stable references
- For context patterns, see `src/contexts/AGENTS.md`

### Styling
- Use Tailwind utility classes
- Support dark mode with `dark:` variants
- Include print styles with `print:` variants where relevant
- Use consistent spacing with Tailwind's spacing scale
- Support responsive design with breakpoints

### Performance
- Use `React.memo` for components that receive stable props
- Implement `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to child components

### Accessibility
- Include proper ARIA labels and descriptions
- Support keyboard navigation
- Maintain logical tab order
- Provide focus indicators

### Testing
- Test component behavior, not implementation
- Mock external dependencies
- Use descriptive test names
- Test error states and edge cases
- For detailed testing patterns, see `src/test/AGENTS.md`