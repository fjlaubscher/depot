# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the @depot/cli package.

## Package Overview

The @depot/cli package is a Node.js command-line tool that fetches Warhammer 40K data from Wahapedia's CSV exports and converts it into structured JSON files for consumption by the web application.

## Development Commands

### Build
```bash
yarn build
# or from root
pnpm --filter @depot/cli run build
```

### Run Data Generation
```bash
yarn start
# or from root
pnpm --filter @depot/cli start
```

### Test
```bash
yarn test
# or from root
pnpm --filter @depot/cli test
```

## Architecture

### Data Processing Pipeline

The CLI follows a three-stage data processing pipeline:

1. **Fetch** (`index.ts`): Downloads CSV files from predefined Wahapedia URLs
2. **Convert** (`convert-to-json.ts`): Transforms CSV data to JSON with cleaning and normalization
3. **Generate** (`generate-data.ts`): Consolidates related data and builds faction-specific files

### Key Components

#### `index.ts` - Main Orchestrator
- Fetches 18 different CSV files from Wahapedia URLs in parallel
- Manages directory creation/cleanup for output files
- Coordinates the conversion and generation pipeline
- Creates both individual JSON files and consolidated faction data

#### `convert-to-json.ts` - CSV Parser
- Handles CSV cleaning (removes BOM, splits on pipe delimiters)
- Converts headers to camelCase format
- Strips HTML tags from data when specified
- Processes pipe-delimited CSV format specific to Wahapedia exports

#### `generate-data.ts` - Data Consolidator
- Reads all JSON files and builds relationships between entities
- Creates comprehensive faction objects with nested datasheets, stratagems, etc.
- Handles complex data associations (abilities → datasheets, wargear profiles, etc.)
- Filters and categorizes content (Forge World, Legends classification)

### Data Flow

```
Wahapedia CSV URLs → Raw CSV → JSON Files → Consolidated Faction Data
                                    ↓
                           Individual JSON files in /json/
                                    ↓
                           Faction-specific files in /data/
                                    ↓
                           Index file for web app navigation
```

### Type System

Uses `types/depot.d.ts` and `types/wahapedia.d.ts`:
- `Wahapedia.*` types represent raw CSV data structure
- `depot.*` types represent processed, web-ready data format
- Type transformation happens in `generate-data.ts` build functions

### Output Structure

- `dist/json/` - Individual converted CSV files
- `dist/data/` - Faction-specific consolidated files  
- `dist/data/index.json` - Navigation index for web app

The generated files should be copied to `packages/web/public/data/` for web consumption.