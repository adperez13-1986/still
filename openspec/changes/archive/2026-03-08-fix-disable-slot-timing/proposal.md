## Why

DisableSlot enemy intents have no effect. Slots are disabled during the enemy turn (after player slots fire) then cleared at the start of the next turn (before player sees planning phase). The disable is applied and removed within the same execution cycle — players never experience it.

## What Changes

- Move `disabledSlots` clearing from `startTurn` to the beginning of `executeEnemyTurn`
- This means: enemy disables slots → player sees them during planning → player's slots fire with disables active → enemy turn clears old disables and potentially applies new ones

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — this is a bug fix to make an existing mechanic actually work)

## Impact

- `src/game/combat.ts` — move disabledSlots clearing from `startTurn` to `executeEnemyTurn`
