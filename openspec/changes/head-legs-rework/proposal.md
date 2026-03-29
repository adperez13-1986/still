## Why

Head and Legs are dead slots — their base actions (draw cards, small block) are too weak to justify placing modifier cards. Players always Override them, making 2 of 4 slots meaningless. This flattens all builds into "what do I do with Arms and Torso?" Every archetype converges on the same slot usage pattern.

This is a systemic problem that content additions can't fix. Head and Legs need qualitatively different actions worth protecting with modifiers.

## What Changes

- **HEAD** becomes control/debuff: equipment applies debuffs (Vulnerable, Weak) to enemies each turn. Different equipment = different debuff type. Worth Amplifying (more stacks), Repeating (apply twice), protecting.
- **LEGS** becomes damage reduction: equipment reduces each incoming hit by a flat amount. Different from Torso block (per-hit reduction vs damage pool). Anti-multi-hit defense. Worth Amplifying (higher reduction), Repeating (stack reduction).
- **Draw** moves to base only: base draw increases from 3 to 5. HEAD no longer provides draw bonus. Draw happens at turn start independent of any equipment.
- **Starter deck** expands from 8 to 12 cards: add 3x Spark (weak Override: 4 damage single) and 3x Patch Job (weak Override: 6 block) as filler cards the player wants to remove.
- All HEAD equipment reworked from draw/foresight to debuff actions.
- All LEGS equipment reworked from block/draw to damage reduction actions.
- New `BodyActionType` values: `'debuff'` and `'reduce'`.

## Capabilities

### New Capabilities

_None — modifies existing systems._

### Modified Capabilities

- `body-actions`: New action types for HEAD (debuff) and LEGS (reduce). Draw removed as equipment action.
- `combat-system`: Debuff application during slot execution. Damage reduction applied per-hit during enemy attacks. Base draw changed to 5. HEAD draw bonus removed from startTurn.
- `card-system`: Starter deck expanded to 12 cards with weak filler.
- `modifier-cards`: Starter deck composition changes. New filler card definitions.

## Impact

- `src/game/types.ts` — new BodyActionType values, remove draw from HEAD equipment pattern
- `src/data/parts.ts` — rework all HEAD equipment (7 pieces) and all LEGS equipment (8 pieces), update starting equipment
- `src/data/cards.ts` — add Spark and Patch Job definitions, expand STARTING_CARDS to 12
- `src/game/combat.ts` — handle debuff action in slot execution, handle reduce action during enemy attacks, change base draw to 5, remove HEAD draw bonus from startTurn
- `src/sim/heuristic.ts` — score debuff and reduce actions for slot modifiers
- `src/components/` — UI may need updates for new action type display
