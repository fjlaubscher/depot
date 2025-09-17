# Core Package

Shared TypeScript types and utilities. Single source of truth for all data structures.

## File Structure

```
src/
├── index.ts              # Main exports
├── types/
│   ├── depot.ts         # Application-ready types
│   └── wahapedia.ts     # Raw CSV data types
```

## Type System

### `depot.*` Types
Application-ready data structures for web consumption:
- `depot.Faction` - Complete faction with nested data
- `depot.Datasheet` - Unit cards with abilities, profiles, wargear
- `depot.Stratagem` - Faction stratagems with CP costs
- `depot.Enhancement` - Character upgrades
- `depot.Settings` - User preferences

### `wahapedia.*` Types
Raw CSV data structure from Wahapedia exports:
- `wahapedia.Datasheet` - Raw datasheet CSV format
- `wahapedia.Ability` - Raw ability CSV format
- `wahapedia.Stratagem` - Raw stratagem CSV format

## Data Flow

```
Wahapedia CSV → wahapedia.* → CLI processing → depot.* → Web app
```

## Usage

```typescript
// CLI package
import { wahapedia, depot } from '@depot/core';

// Web package
import { depot } from '@depot/core';
```