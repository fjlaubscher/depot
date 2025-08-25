# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`depot` is a Warhammer 40,000 companion app powered by Wahapedia data. It's built as a monorepo using Yarn workspaces with two main components:

- **depot-cli**: Node.js CLI that fetches and processes Wahapedia CSV data into JSON format
- **depot-web**: React PWA that displays the processed Warhammer 40K game data

## Development Commands

### Installation
```bash
yarn
```

### Data Generation
Generate data from Wahapedia (run before starting web app):
```bash
yarn workspace depot-cli start
```
This creates `wahapedia.json` in `depot-cli/dist/` - copy this to `depot-web/public/` for the web app.

### Development Server
```bash
yarn start
```
Starts the Vite dev server for the web app.

### Building
```bash
yarn build
```
Builds both CLI and web components.

### Testing
```bash
# Run tests for CLI
yarn workspace depot-cli test

# Run tests for web
yarn workspace depot-web test
```

### Code Quality
```bash
# Format code
yarn format

# Check formatting
yarn lint

# Lint web with TypeScript check
yarn workspace depot-web run lint
```

## Architecture

### depot-cli Architecture
The CLI (`depot-cli/src/index.ts`) orchestrates data processing:
1. Fetches CSV files from Wahapedia URLs
2. Converts CSV to JSON using `convert-to-json.ts`
3. Generates faction-specific data files using `generate-data.ts`
4. Outputs structured JSON files for web consumption

### depot-web Architecture
The web app is a React SPA built with:
- **Router**: React Router DOM with routes for home, factions, datasheets, settings
- **State Management**: Recoil for global state, custom data provider
- **Styling**: SCSS modules
- **PWA**: Vite PWA plugin for offline functionality
- **Data Loading**: Fetches from `/data/index.json` and faction-specific JSON files
- **UI Library**: @fjlaubscher/matter for components and utilities

Key architectural patterns:
- Data Provider pattern for loading and caching Wahapedia data
- Component-based architecture with reusable cards, tables, and filters
- Route-based code splitting with dedicated pages
- Local storage for user settings

### Type System
Shared TypeScript definitions in `types/depot.d.ts` define the complete Warhammer 40K data model including:
- Factions, Datasheets, Abilities, Stratagems
- Wargear, Models, Keywords, Psychic Powers
- Settings and data index structures

## Workspace Structure
- Root package.json manages workspaces and provides unified commands
- Each workspace (depot-cli, depot-web) has independent dependencies and build processes
- Shared type definitions ensure consistency between CLI output and web app consumption