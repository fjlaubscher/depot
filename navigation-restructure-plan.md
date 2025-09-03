# Navigation Restructure Plan

## Overview
Restructure the app navigation to have a proper home page and improve sidebar functionality with direct faction access.

## Current State
- `/` - Shows faction selection with "My Factions" and "All Factions" tabs
- Sidebar has basic navigation + test toast buttons
- My Factions stored in localStorage but only accessible via home tab

## Proposed Structure

### Routes
- `/` - True home page (dashboard, recent activity, quick actions)
- `/factions/` - All factions browsing (move current home page content here)
- `/faction/:id` - Individual faction (unchanged)
- `/faction/:factionId/datasheet/:id` - Individual datasheet (unchanged)
- `/settings` - Settings (unchanged)

### Sidebar Navigation
```
Navigation
├── Home (/)
├── All Factions (/factions/)
└── Settings (/settings)

My Factions (collapsible)
├── Astra Militarum (/faction/astra-militarum)
├── Space Marines (/faction/space-marines)
└── [other favorited factions...]
```

## Implementation Tasks

### Phase 1: Sidebar Updates
1. Remove test toast buttons from AppLayout sidebar
2. Add My Factions submenu with collapsible functionality
3. Integrate with existing localStorage My Factions data
4. Add direct links to favorited factions
5. Update navigation links (Home, All Factions, Settings)

### Phase 2: Route Restructure  
1. Create new `/factions/` route and page component
2. Move current home page logic to `/factions/` page
3. Remove "My Factions" tab from factions page (since it's now in sidebar)
4. Simplify factions page to show only "All Factions" content
5. Create new proper home page at `/`
6. Update all navigation links throughout the app

### Phase 3: New Home Page
1. Design home page layout (dashboard-style)
2. Add quick access sections:
   - Recently viewed factions (if implemented later)
   - Quick faction search
   - Army lists (when that feature is added)
   - App stats/info
3. Consider home page widgets or shortcuts

## Benefits
- Eliminates redundant "My Factions" tab
- Provides direct faction access from anywhere in app
- Sets up proper foundation for future features (army lists, dashboard)
- Cleaner navigation hierarchy
- Better UX for users with multiple favorite factions

## Technical Considerations
- Update React Router configuration
- Ensure all existing links are updated to new routes
- Maintain backward compatibility where possible
- Update tests for new route structure
- Consider implementing route redirects for any bookmarked URLs

## Future Enhancements
- Army Lists submenu in sidebar (when feature is implemented)
- Recently viewed factions in sidebar
- Faction search in sidebar
- Collapsible alliance groupings in sidebar