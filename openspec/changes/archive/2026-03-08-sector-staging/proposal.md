## Why

Sector 1 ends with a boss fight, but there's no transition into Sector 2 — the run just ends. We need a mid-run staging area that lets the player heal, tune their deck, and receive a reward before continuing into the next sector. This keeps the run continuous (deck/equipment/parts carry over) while giving a breather after the boss.

## What Changes

- After defeating a sector boss, instead of ending the run, show a **Staging Area screen**
- The staging area provides: full HP heal, upgrade one card, remove one card, and a bonus reward (choice of S2-pool card, part, or equipment)
- After the player completes the staging area, generate a new maze for the next sector and continue the run
- The victory/run-end flow only triggers after the final sector boss (S3)
- `generateGridMaze` already accepts a sector parameter — the maze can scale per sector

## Capabilities

### New Capabilities
- `sector-staging`: The mid-run staging area screen and sector transition flow — what the player sees and does between sectors

### Modified Capabilities
- `game-core`: Run no longer ends on sector boss defeat (except final sector). Victory flow changes to support multi-sector continuous runs.
- `grid-maze`: Map generation may adjust room counts or grid size per sector.

## Impact

- `src/components/CombatScreen.tsx` — boss defeat flow changes from "end run" to "show staging area"
- `src/store/runStore.ts` — new `advanceSector` action, sector field advances mid-run
- New `src/components/StagingScreen.tsx` component
- `src/components/RunScreen.tsx` — handle sector transitions
- `src/game/mapGen.ts` — may need per-sector tuning
