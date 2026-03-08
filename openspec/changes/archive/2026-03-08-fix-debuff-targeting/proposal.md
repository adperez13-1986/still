## Why

Cards with debuff effects (Target Lock, Glacier Lance) apply Vulnerable/Weak to the player instead of enemies. The `SystemEffect.applyStatus` type only supported `target: 'self'`, so all status applications hit the player regardless of intent.

## What Changes

- Expand `SystemEffect.applyStatus` target type from `'self'` to `'self' | 'all_enemies'`
- Handle `all_enemies` target in combat execution — apply status to all non-defeated enemies
- Fix Target Lock card: change Vulnerable target from `'self'` to `'all_enemies'`
- Fix Glacier Lance heatBonus: change Weak target from `'self'` to `'all_enemies'`

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `combat-system`: applyStatus effects now support targeting enemies in addition to self

## Impact

- `src/game/types.ts` — SystemEffect union type change
- `src/game/combat.ts` — applyStatus case in system effect processing
- `src/data/cards.ts` — Target Lock and Glacier Lance definitions
