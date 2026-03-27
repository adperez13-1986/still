## Why

The exhaust archetype has defensive payoffs (Scrap Recycler, Failsafe Armor) but no offensive scaling. Players who invest in exhaust can survive but can't kill efficiently, making it unviable as a standalone build. Adding an offensive exhaust part — seeded in S1 — gives the archetype a complete identity: inevitable, compounding offense and defense.

## What Changes

- Add a new S1 uncommon behavioral part that provides bonus damage scaling with the exhaust pile size
- This creates an offensive mirror to Failsafe Armor's defensive scaling
- The exhaust build becomes: Scrap Recycler (S1 defense) + new part (S1 offense) → Failsafe Armor (S2 amplifier)

## Capabilities

### New Capabilities

_None — uses existing part and combat systems._

### Modified Capabilities

- `combat-system`: New part effect type that adds bonus damage based on exhaust pile size during slot execution

## Impact

- `src/data/parts.ts` — new part definition, added to S1 parts array
- `src/game/combat.ts` — new part effect handling in `applyPartEffect` and/or slot execution
- `src/game/types.ts` — new effect type if needed
- `src/sim/heuristic.ts` — AI may need awareness of the new part for simulation accuracy
