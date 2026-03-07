## Why

The game has 48+ items across cards, equipment, mods, and enemies, but there's no way to browse them outside of encountering them in a run. A reference compendium accessible from the Workshop lets the player (and developer) see everything the game contains at a glance.

## What Changes

- Add a Compendium screen accessible from the Workshop
- Four tabs: Cards, Equipment, Mods, Bestiary
- All entries fully visible (no discovery gating for now)
- Cards show base version with toggle to view upgraded variant
- Equipment grouped by slot (Head, Torso, Arms, Legs)
- Bestiary grouped by tier (Standard, Elite, Boss) with stats, intent patterns, and drop pools

## Capabilities

### New Capabilities
- `compendium`: Full reference screen for browsing all game content — cards, equipment, mods, and enemies

### Modified Capabilities

## Impact

- `src/components/WorkshopScreen.tsx` — add Compendium button
- `src/components/CompendiumScreen.tsx` — new screen component
- Reads from existing data: `src/data/cards.ts`, `src/data/parts.ts`, `src/data/enemies.ts`
- No new game state required
