# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the @depot/core package.

## Package Overview

The @depot/core package is a shared TypeScript library that provides type definitions and interfaces for the depot ecosystem. It serves as the single source of truth for data structures used across the CLI and web packages.

## Development Commands

### Build
```bash
pnpm build
# or from root
pnpm --filter @depot/core build
```

### Development
```bash
pnpm dev
# or from root
pnpm --filter @depot/core dev
```

### Other Commands
```bash
pnpm format      # Format code
pnpm lint        # Lint with TypeScript check
pnpm typecheck   # TypeScript checking only
pnpm clean       # Clean build artifacts
```

## Architecture

### TypeScript Configuration
- **Base Config**: `tsconfig.json` - Standard development configuration with modern ES2020 target
- **Build Config**: `tsconfig.build.json` - Extends base config, enables declaration generation and dist output
- **Clean Structure**: Simplified from previous complex multi-config setup

### Type System Structure

The core package exports two main type namespaces:

#### `depot.*` Types
These are the processed, application-ready data structures used by the web application:
- `depot.Faction` - Complete faction data with nested relationships
- `depot.Datasheet` - Unit cards with abilities, profiles, and wargear
- `depot.Stratagem` - Faction-specific stratagems with CP costs
- `depot.Enhancement` - Character upgrades with point costs
- `depot.DetachmentAbility` - Army-wide special rules
- `depot.Settings` - User preference configuration

#### `wahapedia.*` Types  
These represent the raw CSV data structure from Wahapedia exports:
- `wahapedia.Datasheet` - Raw datasheet CSV format
- `wahapedia.Ability` - Raw ability CSV format
- `wahapedia.Stratagem` - Raw stratagem CSV format
- `wahapedia.Wargear` - Raw wargear CSV format

### File Structure
```
src/
├── index.ts              # Main exports (namespace re-exports)
├── types/
│   ├── depot.ts         # Application-ready types
│   └── wahapedia.ts     # Raw CSV data types
```

### Type Transformation Flow
```
Raw Wahapedia CSV → wahapedia.* types → @depot/cli processing → depot.* types → @depot/web consumption
```

## Usage Patterns

### In CLI Package
```typescript
import { wahapedia, depot } from '@depot/core';

// Process raw CSV data
const rawDatasheet: wahapedia.Datasheet = parseCSV(data);

// Transform to application format
const processedDatasheet: depot.Datasheet = transformDatasheet(rawDatasheet);
```

### In Web Package  
```typescript
import { depot } from '@depot/core';

// Use processed types for components
interface DatasheetCardProps {
  datasheet: depot.Datasheet;
}
```

## Type Safety & Consistency

### Shared Interfaces
The core package ensures type consistency between:
- CLI data generation output
- Web application data consumption
- Development-time type checking across packages

### Benefits
- **Single Source of Truth**: All type definitions in one place
- **Consistency**: CLI output matches web app expectations exactly
- **Type Safety**: Full TypeScript support across the monorepo
- **Maintainability**: Changes to data structures only need updating in core

## Best Practices

### Adding New Types
1. Add raw CSV types to `wahapedia.ts` first  
2. Add processed types to `depot.ts`
3. Update CLI transformation logic
4. Update web components as needed

### Type Naming
- PascalCase for interface names, camelCase for properties
- `wahapedia` namespace for raw CSV types
- `depot` namespace for application types