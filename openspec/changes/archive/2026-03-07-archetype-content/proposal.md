## Why

The heat system supports four emergent playstyles (Cool Runner, Warm Surfer, Pyromaniac, Oscillator), but only Warm Surfer has meaningful content support. Cool Runner has zero cards or mods that reward staying Cool. Pyromaniac has one card (Meltdown). Oscillator has no trigger type for threshold crossing. Players can't discover these builds because the pieces don't exist yet.

## What Changes

- Add 6 new modifier cards: 2 Cool-conditional, 2 Hot-conditional, 2 Oscillator-flavored
- Add 4 new equipment items: 1 per slot, each leaning toward an underserved archetype
- Add 3 new behavioral mods: 1 Cool Runner, 1 Pyromaniac, 1 Oscillator (introduces `onThresholdCross` trigger)
- Remove enemy intents that directly write to Still's Heat (HeatAttack) — enemies should read/react to heat, not alter it

## Capabilities

### New Capabilities

### Modified Capabilities
- `card-system`: 6 new modifier cards added to Act 1 pool with heat-conditional effects
- `body-actions`: 4 new equipment items (1 per slot) with archetype-leaning effects
- `carried-part`: 3 new behavioral mods including new `onThresholdCross` trigger type
- `enemy-system`: Remove HeatAttack intent type — enemies SHALL NOT directly modify Still's Heat

## Impact

- `src/data/cards.ts` — Add 6 card definitions with upgraded variants, update ACT1_CARD_POOL
- `src/data/parts.ts` — Add 4 equipment definitions, 3 mod definitions, update exports
- `src/game/types.ts` — Add `onThresholdCross` to PartTrigger union, remove `HeatAttack` from IntentType
- `src/game/combat.ts` — Implement threshold-crossing trigger detection, remove HeatAttack handling
- `src/data/enemies.ts` — Remove any HeatAttack intents from enemy definitions
