## Why

Only 10 cycling slot modifiers exist and 9 of them are generically good for every build. Card picks are never meaningful — there's no reason to skip. Adding 14 build-opinionated modifiers (great for one archetype, bad for others) creates real draft decisions and run variety. Also introduces the berserker archetype (pay HP/slots for power) as a 4th build identity.

## What Changes

- Add 14 new slot modifier cards across 5 categories: berserker (4), exhaust-aligned (3), counter-aligned (3+1), stat-aligned (1), build-bridge (3)
- New card mechanics: self-damage, slot self-disable, exhaust pile scaling, cross-slot value references, Power-type permanent effects
- New SlotModifierEffect types needed for cards that don't fit existing categories
- All new cards added to the unified card pool (weighted drop system)

## Capabilities

### New Capabilities

_None — extends existing card and combat systems._

### Modified Capabilities

- `modifier-cards`: 14 new slot modifier definitions with new effect types
- `combat-system`: New effect resolution logic for self-damage, slot disable, exhaust scaling, cross-slot references, Power-type permanents

## Impact

- `src/game/types.ts` — new SlotModifierEffect variants, possibly new SystemEffect for Power-type cards
- `src/data/cards.ts` — 14 new card definitions, added to CARD_POOL and sector pools
- `src/game/combat.ts` — resolve new modifier effects during execution
- `src/sim/heuristic.ts` — AI awareness of new card types for simulation
