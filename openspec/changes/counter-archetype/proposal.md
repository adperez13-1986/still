## Why

Stat stacking (Strength + Amplify on Arms) is the only viable scaling strategy. There's no competing build identity — Feedback was made a good utility card but not build-defining. The Counter archetype creates a genuine alternative: invest in defense (Torso, block) and convert incoming damage into offense. This flips the game's emotional experience — high-damage enemies become fuel instead of threats.

Sim results confirmed: Counter build raised Feedback Loop encounter win rate from 24% to 96%, turning the hardest S2 encounters into the build's best matchups.

## What Changes

- Add **Retaliate** card (S1 pool): slot modifier, Torso-only. Damage absorbed by block is dealt back to the attacker this turn.
- Add **Fortify** card (S2 pool): system card on Torso. Gain 6 block AND deal 6 damage to all enemies. Dual-purpose counter card.
- Add **Thorns Core** part (S1 pool): onDamageTaken trigger. Deal 3 flat damage to the attacker when you take damage.
- Add **retaliate** slot modifier effect type and combat logic for reflecting absorbed block damage during enemy turn.
- Add **thorns** part effect type and combat logic for dealing damage to attackers.
- Update sim heuristic to handle Retaliate card scoring.

## Capabilities

### New Capabilities
_(none — this adds content within existing systems)_

### Modified Capabilities
- `card-system`: New `Retaliate` modifier category and `retaliate` slot effect type
- `carried-part`: New `thorns` part effect type
- `combat-system`: Enemy turn must resolve retaliate damage after attacks, and thorns damage when player takes damage

## Impact

- **Modified files**: `src/game/types.ts` (new types), `src/game/combat.ts` (retaliate/thorns logic in executeEnemyTurn), `src/data/cards.ts` (Retaliate + Fortify defs), `src/data/parts.ts` (Thorns Core def), `src/sim/heuristic.ts` (scoring)
- **No new dependencies**
- **Prototype already in codebase** from sim testing — tasks formalize and verify what exists
