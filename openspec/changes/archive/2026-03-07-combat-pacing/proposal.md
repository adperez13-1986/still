## Why

Combat currently resolves instantly — clicking Execute updates all numbers in a single frame. There's no visual rhythm between planning and resolution, so turns blur into repetitive clicking. Adding step-by-step execution pacing and damage feedback creates the "moment of impact" that makes each turn feel meaningful.

## What Changes

- Add a sequential execution phase that reveals each body slot firing one at a time (~400ms between each)
- Add an enemy action phase that shows each enemy acting sequentially
- Show floating damage/block numbers on hits
- Add screen flash on damage taken
- Add CSS transitions to health bars, block, and heat gauge so values animate smoothly
- Block player input during the execution/enemy animation sequence
- No new dependencies — all animation via CSS transitions + React state timing

## Capabilities

### New Capabilities
- `combat-animation`: Execution phase step-by-step pacing, damage number popups, screen feedback effects, CSS transitions on combat values

### Modified Capabilities
None — existing combat behavior is unchanged. This only adds visual pacing to the existing resolution flow.

## Impact

- `src/components/CombatScreen.tsx` — Execution flow becomes async (step through slots with delays)
- `src/store/runStore.ts` — `executeTurn` may need to be split into discrete steps, or a combat log added for UI replay
- `src/components/StillPanel.tsx` — CSS transitions on health/block bars
- `src/components/EnemyCard.tsx` — CSS transitions on enemy health, damage number display
- `src/components/HeatTrack.tsx` — CSS transition on heat gauge
- `src/components/BodySlotPanel.tsx` — Highlight active slot during execution sequence
- New component: `DamageNumber.tsx` — floating damage/block popup
