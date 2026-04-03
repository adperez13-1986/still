## Why

Every S1 enemy cycles through fixed Attack/Block/Buff patterns. The optimal response to all of them is the same: push everything, vent when safe. No enemy tests a specific player strategy, so no build is better or worse against any encounter. The growth tree creates build diversity, but enemies don't test it.

Six new enemy roles that each punish a different strategy and reward a different build. These enemies react to what the player does — reading past actions, current strain, or combat state during their turn. This requires extending the intent system with reactive intent types that look backward, not forward.

## What Changes

**Six new enemy roles:**

- **Punisher** — counter-attacks 3 damage per pushed slot this turn. Tests selective pushing. "Push everything" players take 9 damage per turn.
- **Scaler** — gains +3 Strength every turn it doesn't take damage. Tests kill speed. Turtling loses.
- **Pressure Reader** — deals bonus damage equal to strain ÷ 5 per hit. Tests strain management. High-strain berserkers get punished.
- **Charger** — charges for 2 turns (doing nothing), then hits for 28. Tests burst damage or heavy mitigation.
- **Splitter** — on death, spawns 2 fragments (12 HP, 6 attack each). Tests AoE and kill order.
- **Mirror** — copies the player's highest-value action from this turn. Restraint is rewarded.

**Engine extension:**

- New reactive intent types: `Retaliate`, `StrainScale`, `CopyAction`
- Enemies resolve reactive intents by reading current turn state (pushed slots, strain, player actions) during enemy turn — lookback, not lookahead
- On-death trigger for Splitter (spawn fragments)
- Charge counter for Charger (intent changes based on internal counter)
- Scaler uses existing Buff/Strength but conditioned on "took no damage this turn"

## Capabilities

### New Capabilities
- `reactive-intents`: New intent types that read player state during enemy resolution — Retaliate, StrainScale, CopyAction
- `enemy-triggers`: On-death and conditional-turn behaviors — Splitter spawn, Scaler conditional buff, Charger countdown

### Modified Capabilities
- `enemy-system`: EnemyDefinition extended with optional reactive intent types and trigger behaviors
- `combat-system`: Enemy turn resolution handles new intent types by reading combat state from the current turn

## Impact

- `src/game/types.ts` — new IntentTypes, optional trigger fields on EnemyDefinition
- `src/game/strainCombat.ts` — enemy turn resolution extended for reactive intents, on-death triggers, charge counters
- `src/data/enemies.ts` — six new enemy definitions using new intent types
- `src/components/StrainCombatScreen.tsx` — display reactive intents (e.g., "Retaliates 3/push", "Attack 8 (+strain)")
