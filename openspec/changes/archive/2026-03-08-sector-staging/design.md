## Overview

When the player defeats a sector boss (except the final sector), the run does not end. Instead, a Staging Area screen appears where the player heals, tunes their deck, and receives a bonus reward. After the staging area, a new maze is generated for the next sector and the run continues.

## Flow

```
Boss defeated
  -> CombatScreen detects boss victory + not final sector
  -> Navigate to /staging (new route)
  -> StagingScreen renders with 3 sequential steps
  -> Player completes all steps
  -> runStore.advanceSector() generates next maze
  -> Navigate to /run (map screen for new sector)
```

## Staging Area Screen

The staging area is a single screen with sequential steps. Each step is presented one at a time (not all at once) to create a sense of progression.

### Step 1: Repair (automatic)
- Full heal to maxHealth
- Brief narrative text: sector-appropriate flavor
- Visual confirmation, then auto-advance after 1.5s or tap

### Step 2: Upgrade a card
- Show all cards in deck
- Player taps one to upgrade it (if not already upgraded)
- Can skip if desired
- Same UI pattern as rest room card upgrade

### Step 3: Remove a card
- Show all cards in deck (post-upgrade)
- Player taps one to remove it permanently
- Can skip — some players want a big deck
- Minimum deck size of 5 to prevent degenerate states

### Step 4: Bonus reward
- Choose one of three options:
  - A card from the next sector's card pool (pick 1 of 3)
  - A random behavioral part from the next sector's part pool
  - A random equipment piece from the next sector's equipment pool
- This previews what's coming and gives the player a head start

After all steps, a "CONTINUE" button generates the next sector maze.

## Store Changes

### runStore
- `advanceSector()`: increment `sector`, generate new maze via `generateGridMaze(newSector)`, set `map` to the new maze, clear `combat` to null
- Boss defeat in CombatScreen: if `sector < 3`, navigate to staging instead of ending run
- Final sector boss: keep existing victory flow (end run, return to workshop)

### No persistence changes needed
The staging area is mid-run — no permanent state is affected. Shards, deck, equipment, parts all remain in RunState.

## Map Scaling

`generateGridMaze` already takes a sector parameter. For now, S2 uses the same 7x7 grid. Future changes can adjust room counts or grid size per sector.

## Component Design

`StagingScreen.tsx`:
- Manages a `step` state (1-4)
- Each step renders its own sub-view
- Step 2 reuses card upgrade logic from RestScreen
- Step 3 is new (card removal) — simple list with tap-to-remove
- Step 4 is a 3-option choice similar to RewardScreen
- After step 4, shows "CONTINUE TO SECTOR N" button
