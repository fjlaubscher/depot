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

### Data Generation
Generate data from Wahapedia (run before starting web app):
```bash
pnpm --filter @depot/cli start
# or shorthand
pnpm cli
```
This creates `wahapedia.json` in `packages/cli/dist/` - copy this to `packages/web/public/` for the web app.

To force re-download of source data:
```bash
pnpm --filter @depot/cli start -- --force-download
```

### Development Server
```bash
pnpm start
```

### Building
```bash
pnpm build
```

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

# Check formatting and TypeScript
pnpm lint

# Lint web with TypeScript check
pnpm --filter @depot/web run lint
```

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
- **Styling**: Tailwind CSS v4 with PostCSS integration and system dark mode support
- **UI Library**: Custom component library in `src/components/ui/`
- **State Management**: Context-based architecture (App, Layout, Toast contexts)
- **Data Storage**: IndexedDB integration for offline-first functionality
- **PWA**: Vite PWA plugin for offline capabilities
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

## Workspace Structure
- Root package.json manages pnpm workspaces and provides unified commands
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