# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`depot` is a Warhammer 40,000 companion app powered by Wahapedia data. Built as a monorepo using pnpm workspaces with packages in `packages/`:

- **@depot/cli**: Node.js CLI that fetches and processes Wahapedia CSV data into JSON format
- **@depot/core**: Shared types and utilities for the depot ecosystem  
- **@depot/web**: React PWA that displays the processed Warhammer 40K game data

## Development Commands

### Installation
```bash
pnpm install
```

### Development Workflow
Start the application (generates fresh data and starts dev server):
```bash
pnpm start
```

Start dev server only (requires existing data):
```bash
pnpm dev
```

### Data Generation
Generate fresh data from Wahapedia:
```bash
pnpm --filter @depot/cli start
```
This creates JSON files in `packages/cli/dist/` which are automatically copied to `packages/web/public/data/` by the build scripts.

To force re-download of source data and copy to web app:
```bash
pnpm refresh-data
```

This runs: CLI build → CLI start with `--force-download` → copy data to web app

### Building
Production build (builds all packages, generates data, copies to built web app):
```bash
pnpm build
```

This runs: `pnpm -r build` → `pnpm --filter @depot/cli start` → `node scripts/copy-data.mjs`

### Testing
```bash
# Test specific packages
pnpm --filter @depot/cli test
pnpm --filter @depot/web test
```

### Code Quality
All packages have unified scripts:
```bash
# Format all code
pnpm format

# Lint all code (includes TypeScript checking)  
pnpm lint

# TypeScript checking only
pnpm --filter @depot/core typecheck
pnpm --filter @depot/cli typecheck
pnpm --filter @depot/web typecheck
```

**Important**: Always run `pnpm format` before committing changes to ensure consistent code formatting across the repository.

## Architecture

### @depot/cli Architecture
See `packages/cli/CLAUDE.md` for detailed CLI documentation.

The CLI orchestrates data processing:
1. Fetches CSV files from Wahapedia URLs
2. Converts CSV to JSON using `convert-to-json.ts`
3. Generates faction-specific data files using `generate-data.ts`
4. Outputs structured JSON files for web consumption

### @depot/web Architecture
See `packages/web/CLAUDE.md` for detailed web app documentation.

Modern React PWA with:
- **React 19**: Latest React with React Router DOM v7 for navigation
- **Build System**: Vite 6 with TypeScript 5.9+ support
- **Styling**: Tailwind CSS v4 with PostCSS integration and system dark mode support
- **UI Library**: Custom component library in `src/components/ui/`
- **State Management**: Context-based architecture (App, Layout, Toast contexts)
- **Data Storage**: IndexedDB integration for offline-first functionality
- **PWA**: Vite PWA plugin with asset generation for offline capabilities
- **Testing**: Vitest with React Testing Library and jsdom
- **Layout**: Responsive design with desktop sidebar and mobile slide-out navigation

## Key Architectural Patterns

### Context Architecture
See `packages/web/src/contexts/CLAUDE.md` for detailed context patterns.

Modular contexts with constants, types, reducer, provider, and custom hook files.

### Page Architecture
See `packages/web/src/pages/CLAUDE.md` for detailed page implementation patterns.

Consistent page structure with component breakdown, utility extraction, and comprehensive testing.

### Component Library
Custom Tailwind-based UI components with dark mode support and TypeScript interfaces.

### Testing Infrastructure
See `packages/web/src/test/CLAUDE.md` for comprehensive testing guidelines.

Centralized testing utilities with TestWrapper and mock data patterns.

## Type System
Shared TypeScript definitions in `@depot/core` define the complete Warhammer 40K data model:
- Factions, Datasheets, Abilities, Stratagems
- Wargear, Models, Keywords
- Enhancements, Detachment Abilities
- Settings and data index structures

## Requirements
- **Node.js**: >=22.0.0
- **Package Manager**: pnpm >=8.0.0

## Workspace Structure
- Root package.json manages pnpm workspaces and provides unified commands via `pnpm --filter @depot/package-name script`
- All packages have consistent script naming: `build`, `clean`, `dev`, `format`, `lint`, `typecheck`
- Each package in `packages/` has independent dependencies and build processes
- **@depot/core** provides shared type definitions ensuring consistency between CLI output and web app consumption
- Modern scoped package naming (`@depot/cli`, `@depot/core`, `@depot/web`)

## File Naming Conventions
- **React Components**: PascalCase directories with `index.tsx` (`Button/index.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-app-context.ts`)
- **Constants**: kebab-case (`breakpoints.ts`)
- **Types**: kebab-case (`types.ts`)
- **Utilities**: kebab-case descriptive names

## Data Flow
- **API Data**: `/data/index.json` → App Context → Components
- **Faction Data**: `/data/[factionId].json` → Cached in App Context with IndexedDB
- **UI State**: Layout Context (sidebar, modals, etc.)
- **Notifications**: Toast Context (success, error, info, warning)
- **User Settings**: IndexedDB + App Context

## Best Practices
- **Code Organization**: Single responsibility components, extract logic to utilities
- **Performance**: Debounced inputs, proper memoization, skeleton loading
- **User Experience**: Meaningful loading/error/empty states
- **Testing**: Centralized utilities, comprehensive coverage, React 19 compliance
- **Accessibility**: Proper ARIA attributes, semantic HTML, keyboard navigation