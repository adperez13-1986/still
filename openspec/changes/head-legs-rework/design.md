## Context

Head and Legs have been Override dumps since launch. Draw reduction to 3 base was meant to make HEAD essential, but it failed — 3 draw + HEAD bonus = 4-5 cards, and with 8E you can only play 4 anyway. Overriding HEAD is almost always correct.

This rework gives Head and Legs distinct mechanical identities that create real modifier decisions for all 4 slots.

## Goals / Non-Goals

**Goals:**
- Head and Legs worth placing Amplify/Repeat on instead of Override
- 4 meaningful slot decisions per turn instead of 2
- Builds diverge based on which slots they invest in
- Draw 5 + 12-card starter deck creates "which card do I NOT play?" tension

**Non-Goals:**
- Not redesigning Arms or Torso
- Not adding new modifier cards specifically for Head/Legs (future pass)
- Not changing the energy system

## Decisions

### HEAD action type: `debuff`

HEAD equipment fires during execution and applies a debuff to the targeted enemy (or all enemies for AoE variants).

```
New BodyActionType: 'debuff'
BodyAction: { type: 'debuff', baseValue: N, targetMode, debuffType: StatusEffectType }
```

The `baseValue` is the number of stacks applied. Amplify multiplies stacks (floored). Repeat applies debuff again.

Equipment progression:
| Equipment | Rarity | Debuff | Stacks | Target |
|-----------|--------|--------|--------|--------|
| Scrap Scanner (reworked) | Common | Vulnerable | 1 | single |
| Cracked Lens (reworked) | Common | Weak | 1 | single |
| Calibrated Optics (reworked) | Uncommon | Vulnerable | 1 | all |
| Tactical Visor (reworked) | Uncommon | Weak | 2 | single |
| Thermal Imager (reworked S2) | Uncommon | Vulnerable | 2 | single |
| Neural Sync (reworked) | Rare | Vulnerable | 1 | all, + Weak 1 |
| Pyroclast Scanner (reworked) | Rare | Weak | 2 | all |
| Predictive Array (reworked S2) | Rare | Vulnerable | 2 | all |

### LEGS action type: `reduce`

LEGS equipment sets a per-hit damage reduction for the turn. During enemy attacks, each hit is reduced by the reduction value before block absorbs the remainder.

```
New BodyActionType: 'reduce'
BodyAction: { type: 'reduce', baseValue: N, targetMode: 'self' }
```

Resolution order for incoming damage per hit:
1. Reduction applied (reduce hit by LEGS value, min 0)
2. Block absorbs remaining
3. HP takes the rest

Amplify multiplies reduction value. Repeat doubles the reduction (fires twice = adds baseValue again).

Equipment progression:
| Equipment | Rarity | Reduction | Notes |
|-----------|--------|-----------|-------|
| Scrap Actuators (reworked) | Common | 2 per hit | |
| Salvaged Treads (reworked) | Uncommon | 3 per hit | |
| Adaptive Treads (reworked) | Uncommon | 2 per hit | + gain 2 block |
| Hydraulic Pump (reworked S2) | Uncommon | 3 per hit | + gain 2 block |
| Cryo Lock (reworked) | Rare | 4 per hit | |
| Thermal Exhaust (reworked) | Rare | 3 per hit | + gain 3 block |
| Stabilizer Treads (reworked S2) | Rare | 4 per hit | + gain 2 block |

Some LEGS equipment has bonus block alongside reduction — this is the "hybrid" tier that partially overlaps with Torso.

### Draw: base 5, no HEAD bonus

`drawCount` stays at 3 in RunState but `startTurn` hardcodes total draw to 5 (or we set drawCount to 5). HEAD draw bonus logic removed entirely.

Simplest: change `drawCount: 3` → `drawCount: 5` in the run initialization and remove HEAD draw bonus from startTurn.

### Starter deck: 12 cards

```
1x Boost (Amplify +50%)
1x Emergency Strike (Override: 8 dmg AoE)
1x Emergency Shield (Override: 12 Block)
1x Diagnostics (System: draw 2)
2x Vent (System: draw 2)
3x Spark (Override: 4 dmg single) — NEW filler
3x Patch Job (Override: 6 block) — NEW filler
```

Spark and Patch Job are deliberately weak Overrides that function early but become dead weight. Players should actively seek card removal or better replacements.

### Damage reduction resolution

In `executeEnemyTurn`, before block absorption per hit:

```
// Before: dealt = perHit; absorbed = min(block, dealt)
// After:
dealt = max(0, perHit - reductionValue)
absorbed = min(block, dealt)
actual = dealt - absorbed
```

The `reductionValue` is set during `executeBodyActions` when LEGS fires, stored on combat state (similar to `retaliateActive`).

### Starting equipment

- HEAD: Scrap Scanner (apply 1 Vulnerable to single enemy)
- TORSO: Scrap Plating (unchanged, 3 block)
- ARMS: Piston Arm (unchanged, 6 damage)
- LEGS: Scrap Actuators (reduce each hit by 2)

### Foresight

Foresight was a HEAD equipment property. With HEAD becoming debuff, foresight moves to a part effect or is removed. Simplest: remove foresight for now, revisit later. It was underused anyway.

## Risks / Trade-offs

- [12-card starter with draw 5 = see 5/12 per turn] → Enough variety. By turn 3 you've seen most cards. System card exhaust thins the deck quickly.
- [Damage reduction might stack too well with block] → Reduction applies BEFORE block, so high reduction + high block = near invulnerability. May need caps. Watch in playtesting.
- [HEAD debuffs might be too strong with Repeat] → Repeat HEAD = 2 stacks Vulnerable per turn = permanent +50% damage. Strong but costs a modifier slot. Comparable to Repeat on Arms.
- [Removing foresight] → Minor feature loss. Was only on 3 equipment pieces and rarely impacted decisions.
- [Massive change surface] → Touching types, equipment, cards, combat, starter deck, sim all at once. High risk of bugs. Thorough testing needed.
