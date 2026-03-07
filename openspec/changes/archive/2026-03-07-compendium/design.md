## Context

The game has 18 modifier cards, 8 equipment items, 8 behavioral mods, and 14 enemies defined in `src/data/`. Currently the only way to see them is during a run. The Workshop is the between-runs hub and the natural home for a reference screen.

## Goals / Non-Goals

**Goals:**
- Browsable reference for all game content from the Workshop
- Clean tab-based layout that works on mobile and desktop
- Cards show base + upgraded variants with a toggle

**Non-Goals:**
- Discovery/unlock tracking (deferred to post-release)
- In-combat tooltips or contextual popups
- Filtering, searching, or sorting
- Tutorial or mechanics explanation pages

## Decisions

### Single new screen component, not an overlay
The Compendium is a full screen (`CompendiumScreen`) navigated to from Workshop, not a modal overlay. This keeps it consistent with how Workshop, Shop, and other screens work.

**Alternative considered:** Overlay/modal — rejected because the content is too dense for an overlay and would need its own scroll context.

### Tab-based navigation with four categories
Cards | Equipment | Mods | Bestiary. Tabs render as a horizontal bar at the top. Each tab renders a scrollable grid/list of entries.

### Cards: base with inline upgrade toggle
Each card entry shows the base version. A small toggle or tap expands to show the upgraded variant inline (not a separate entry). This keeps the list compact while still surfacing upgrade info.

### Equipment: grouped by slot
Entries grouped under Head, Torso, Arms, Legs headers. 2 items per slot currently — will scale as content grows.

### Bestiary: grouped by tier
Standard enemies, then Elites, then Boss. Each entry shows name, HP, intent pattern summary, and drop pool.

## Risks / Trade-offs

- [Mobile layout] Dense content on small screens → Use compact card-style entries that expand on tap
- [Future discovery mode] Switching to progressive discovery later will require adding permanent state tracking → Acceptable: the component can be refactored to filter visibility without structural changes
