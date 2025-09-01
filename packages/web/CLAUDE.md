# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the @depot/web package.

## Package Overview

The @depot/web package is a React Progressive Web App (PWA) that displays Warhammer 40K game data processed by @depot/cli. It provides an offline-capable interface for browsing factions, datasheets, stratagems, and other game content.

## Current Architecture Status

### ✅ Modern Implementation (V2 Pages)
The application now uses a modern architecture with:
- **Primary Routes**: V2 pages serve as the main application interface
- **Context-Based State**: App, Layout, and Toast contexts replace legacy Recoil patterns
- **Offline-First Data**: IndexedDB integration with automatic caching and offline support
- **Custom UI Library**: Tailwind CSS v4 components in `src/components/ui/`
- **100% Test Coverage**: Comprehensive test suite with proper provider integration
- **TypeScript**: All compilation errors resolved, strict typing throughout

### V2 Page Architecture
- **Home Page (`pages/v2/home/`)**: Modern faction browsing with search/filtering
- **Faction Page (`pages/v2/faction/`)**: Tabbed interface for datasheets, detachments, enhancements, stratagems
- **Test Infrastructure**: Full test coverage with Layout/Toast provider integration
- **Component Structure**: Modular components with data-testid attributes for testing

### Legacy Components (Being Phased Out)
- Some datasheet/settings pages still use `@fjlaubscher/matter` components
- Legacy routing coexists with V2 routes during transition
- Recoil atoms still used in some legacy components

## Development Commands

### Development Server
```bash
yarn start
# or from root
pnpm --filter @depot/web run start
```

### Build for Production
```bash
yarn build
# or from root
pnpm --filter @depot/web run build
```

### Testing
```bash
yarn test
# or from root
pnpm --filter @depot/web test
```

### Code Quality
```bash
# Lint with TypeScript check
yarn lint

# Format code
yarn format
```

## Architecture

### Technology Stack
- **React 18** with React Router DOM for navigation
- **Context + useReducer** for global state management (replaced Recoil)
- **IndexedDB** for offline-first data storage and caching
- **Tailwind CSS v4** for utility-first styling (replaced SCSS modules)
- **Custom UI Library** in `src/components/ui/` (replaced @fjlaubscher/matter)
- **Vite** for build tooling and development server
- **Vite PWA Plugin** for offline functionality

### Application Structure

#### Route-Based Architecture
- `/` - Home page with faction selection
- `/faction/:id` - Faction overview with datasheets, stratagems, etc.
- `/faction/:factionId/datasheet/:id` - Individual datasheet details
- `/settings` - User preferences (show Forge World, Legends content)

#### State Management Pattern
- **App Context**: Global state for data index, faction cache, and settings using useReducer
- **Layout Context**: UI state management (sidebar, responsive behavior)
- **Toast Context**: Notification system with auto-dismiss functionality
- **IndexedDB Storage**: Primary storage for faction data, index, and settings (offline-first)

#### Component Architecture
- **Page Components**: Route-specific containers (`pages/`)
- **Custom UI Components**: Tailwind-based component library (`components/ui/`)
- **Modular Pages**: Component breakdown pattern with focused child components
- **Layout Component**: Responsive app shell with desktop sidebar and mobile slide-out

### Key Components

#### Data Provider (`components/data-provider/`)
- Fetches faction index on app load
- Manages loading states and data availability
- Integrates with Recoil state atoms
- Handles initial settings configuration

#### Faction Pages (`pages/faction/`)
- Lazy loads faction-specific data from `/data/{factionId}.json`
- Tabbed interface for datasheets, stratagems, psychic powers, etc.
- Filtering and search functionality
- Settings-aware content display (Forge World/Legends filtering)

#### Datasheet Pages (`pages/datasheet/`)
- Detailed unit information display
- Profile tables for models and wargear
- Associated stratagems and abilities
- Mobile-optimized responsive design

### Data Flow (Offline-First)

```
IndexedDB ──→ App Context ──→ React Components
   ↑               ↓
   └─ Static JSON Files (network fallback)
   
Settings: IndexedDB ←→ App Context ←→ Settings Page
Faction Data: IndexedDB → App Context → Faction Pages
             (Auto-cached from network when visited)
```

### PWA Features
- **Offline Support**: Service worker caches static assets and data files
- **App Manifest**: Installable as native-like app experience
- **Icon Assets**: Full set of platform-specific icons in `public/`
- **Responsive Design**: Mobile-first approach with desktop enhancements

### Type System
Uses shared `types/depot.d.ts` with web-specific additions:
- `depot.Settings` interface for user preferences
- Component prop interfaces
- Vite environment types (`types/vite-env.d.ts`)

### Build Configuration
- **Vite Config** (`vite.config.ts`): React plugin + PWA configuration  
- **TypeScript**: Strict mode with path resolution
- **SCSS**: Global styles + module system
- **Asset Optimization**: Icon generation and static file handling

## Data Requirements

The web app expects processed data files in `public/data/`:
- `index.json` - Faction index for navigation
- `{factionId}.json` - Individual faction data files
- Generated by running `pnpm --filter @depot/cli start`