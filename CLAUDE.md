# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`depot` is a Warhammer 40,000 companion app powered by Wahapedia data. It's built as a monorepo using pnpm workspaces with packages located in `packages/`:

- **@depot/cli**: Node.js CLI that fetches and processes Wahapedia CSV data into JSON format
- **@depot/core**: Shared types and utilities for the depot ecosystem  
- **@depot/web**: React PWA that displays the processed Warhammer 40K game data

## Development Commands

### Installation
```bash
pnpm install
```

### Data Generation
Generate data from Wahapedia (run before starting web app):
```bash
pnpm --filter @depot/cli start
# or shorthand
pnpm cli
```
This creates `wahapedia.json` in `packages/cli/dist/` - copy this to `packages/web/public/` for the web app.

To force re-download of source data (ignoring existing files):
```bash
pnpm --filter @depot/cli start -- --force-download
```

### Development Server
```bash
pnpm start
```
Starts the Vite dev server for the web app.

### Building
```bash
pnpm build
```
Builds both CLI and web components.

### Testing
```bash
# Run tests for CLI
pnpm --filter @depot/cli test

# Run tests for web
pnpm --filter @depot/web test
```

### Code Quality
```bash
# Format code
pnpm format

# Check formatting
pnpm lint

# Lint web with TypeScript check
pnpm --filter @depot/web run lint
```

## Architecture

### @depot/cli Architecture
The CLI (`packages/cli/src/index.ts`) orchestrates data processing:
1. Fetches CSV files from Wahapedia URLs
2. Converts CSV to JSON using `convert-to-json.ts`
3. Generates faction-specific data files using `generate-data.ts`
4. Outputs structured JSON files for web consumption

### @depot/web Architecture
The web app is a React SPA currently undergoing modernization (Phase 1 complete):

#### Current Stack (Phase 1 - COMPLETE)
- **Styling**: Tailwind CSS v4 with PostCSS integration and system dark mode support
- **UI Library**: Custom component library in `src/components/ui/` (Button, IconButton, Card, Grid, Layout, Field, SelectField, Loader, Toast, ToastContainer)
- **State Management**: Modular context architecture replacing Recoil:
  - App Context: Global data and business logic (`src/contexts/app/`)
  - Layout Context: UI state management (`src/contexts/layout/`)
  - Toast Context: Notification system (`src/contexts/toast/`)
- **Layout**: Responsive layout with desktop sidebar and mobile slide-out navigation

#### Phase 2 Progress (PARTIALLY COMPLETE)
- **Router**: ✅ Updated React Router DOM with v2 pages as primary routes
- **State Management**: 🔄 Partial migration - v2 hooks coexist with legacy Recoil atoms
- **PWA**: Vite PWA plugin for offline functionality
- **Data Loading**: ✅ App Context handles faction caching, fetches from `/data/index.json`
- **Legacy UI**: 🔄 New UI components in use, some @fjlaubscher/matter still in legacy pages

#### Key Architectural Patterns
- **Context Pattern**: Modular contexts with constants, types, reducer, provider, and custom hook files
- **Component Pattern**: Tailwind-based UI components with dark mode support and TypeScript interfaces
- **Data Provider Pattern**: Loading and caching Wahapedia data (needs migration to new contexts)
- **Route-based Architecture**: Dedicated pages with code splitting
- **Settings Management**: Local storage integration

## 10th Edition Migration Status

### ✅ Completed
- **Data Structure**: Updated for 10th edition rules (removed Psychic Powers, Relics, Warlord Traits)
- **Core Pages**: Modern v2 Home and Faction pages with full functionality
- **Test Infrastructure**: 100% test coverage (100/100 tests passing)
- **TypeScript**: All compilation errors resolved, strict typing throughout
- **Architecture**: Modern context-based state management operational
- **IndexedDB Integration**: Offline-first data storage with automatic caching and settings persistence
- **UI Components**: Custom Tailwind-based component library in production use
- **Code Quality**: Comprehensive cleanup - removed 660+ lines of obsolete 9th edition code

### 🔄 In Progress 
- **Legacy Page Migration**: Some datasheet/settings pages still use @fjlaubscher/matter
- **Recoil Replacement**: Gradual migration to context-based state management
- **Component Library**: Continued expansion of custom UI components

### 📋 Architecture Achievements
- **Test Setup**: Moved from `/tests` to `/src/test-setup.ts` with proper vitest integration
- **Route Modernization**: V2 pages now serve as primary application routes  
- **Context Integration**: Layout + Toast providers working seamlessly with test infrastructure
- **Component Testing**: Comprehensive test coverage with proper mocking and data-testid patterns

### Type System
Shared TypeScript definitions in `types/depot.d.ts` define the complete Warhammer 40K data model including:
- Factions, Datasheets, Abilities, Stratagems
- Wargear, Models, Keywords, Psychic Powers
- Settings and data index structures

## Workspace Structure
- Root package.json manages pnpm workspaces and provides unified commands
- Each package in `packages/` has independent dependencies and build processes
- **@depot/core** provides shared type definitions ensuring consistency between CLI output and web app consumption
- Modern scoped package naming (`@depot/cli`, `@depot/core`, `@depot/web`)

## Development Patterns & Best Practices

### Context Architecture (src/contexts/)
Each context follows a consistent modular pattern:
```
contexts/
├── [context-name]/
│   ├── constants.ts        # Action type constants (UPPER_SNAKE_CASE)
│   ├── types.ts           # TypeScript interfaces and action types
│   ├── reducer.ts         # State reducer with initial state
│   ├── context.tsx        # Provider component with useReducer
│   └── use-[name]-context.ts # Custom hook for consuming context
```

**Rules**:
- Use kebab-case for filenames (`use-app-context.ts`)
- No barrel files (`index.ts`) - import directly from specific files
- Action constants in frozen objects: `export const ACTIONS = { ... } as const`
- Always validate context usage with proper error messages
- Document context relationships in `src/contexts/CLAUDE.md`

### Component Architecture (src/components/ui/)
Custom components built with Tailwind CSS:
- **Props**: Extend native HTML element props where possible
- **Variants**: Use discriminated unions for component variants
- **Dark Mode**: All components support `dark:` classes for system theme detection
- **Accessibility**: Include proper ARIA attributes and semantic HTML
- **TypeScript**: Strict typing with interface definitions

### File Naming Conventions
- **React Components**: PascalCase directories with `index.tsx` (`Button/index.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-app-context.ts`)
- **Constants**: kebab-case (`breakpoints.ts`)
- **Types**: kebab-case (`types.ts`)
- **Utilities**: kebab-case descriptive names

### State Management Migration Status
- ✅ **Phase 1 Complete**: New context system established alongside legacy Recoil
- ⏳ **Phase 2 TODO**: Migrate page components from Recoil to App Context
- ⏳ **Phase 3 TODO**: Remove Recoil dependency entirely
- **Current**: Both systems coexist during transition period

### Styling Guidelines
- **Tailwind CSS v4**: Use utility classes, avoid custom CSS when possible
- **Dark Mode**: System preference detection with `dark:` variants
- **Breakpoints**: Import from `src/constants/breakpoints.ts` (matches Tailwind defaults)
- **Responsive Design**: Mobile-first approach with `lg:` for desktop
- **Component Spacing**: Use Tailwind spacing scale (`space-y-4`, `p-4`, etc.)

### Testing & Quality
- **Linting**: Run `pnpm --filter @depot/web run lint` for TypeScript + Prettier checks
- **Building**: Ensure `pnpm build` passes before committing
- **Dev Server**: Use `pnpm start` for hot-reload development

### Data Flow Patterns
- **API Data**: `/data/index.json` → App Context → Components
- **Faction Data**: `/data/[factionId].json` → Cached in App Context
- **UI State**: Layout Context (sidebar, modals, etc.)
- **Notifications**: Toast Context (success, error, info, warning)
- **User Settings**: Local Storage + App Context

### Important Migration Notes
1. **Component Library**: Phase out `@fjlaubscher/matter` - replace with `src/components/ui/`
2. **State Management**: Gradually replace Recoil atoms with context hooks
3. **Styling**: Convert SCSS modules to Tailwind utility classes
4. **Dark Mode**: All new components must support system theme detection
5. **Responsive Layout**: Desktop sidebar + mobile slide-out is now the standard pattern