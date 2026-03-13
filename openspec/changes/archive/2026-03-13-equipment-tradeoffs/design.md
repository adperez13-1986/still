## Context

Equipment currently has 20 items across 4 slots. All are pure upgrades — rarer is always better. The equipment system supports: `heatBonusThreshold`/`heatBonusValue` (conditional stat bonus), `extraHeatGenerated` (+heat on fire), `bonusBlockPerHeatLost` (block per cooling), and `bonusHeal`. We're adding 11 new equipment pieces with tradeoff mechanics to create archetype-defining decisions.

## Goals / Non-Goals

**Goals:**
- Add tradeoff equipment at uncommon (slot tension) and rare (build-around) tiers
- Give Pyromaniac archetype viable equipment options, especially for LEGS
- Every slot has a Cool Runner rare, a Pyromaniac rare, and a generalist option
- New mechanics: conditional-only firing, multi-fire in zone, Block loss on fire, combined actions

**Non-Goals:**
- Restructuring equipment drops into sector pools (keep flat pool for now)
- Rebalancing existing equipment stats (only reclassify rarity where needed)
- Domain-breaking equipment (TORSO doing damage, etc.)

## Decisions

### 1. New EquipmentDefinition fields for new mechanics

Add to `EquipmentDefinition`:
- `heatConditionOnly?: HeatThreshold` — equipment ONLY fires when in this zone. Outside the zone, slot produces nothing. Used by Cryo Cannon (Cool only).
- `multiFire?: { threshold: HeatThreshold; extraFirings: number }` — fires extra times while in the specified zone. Used by Meltdown Cannon (fires twice while Hot).
- `blockCost?: number` — lose this much Block when the slot fires. Used by Shrapnel Launcher.

**Why not reuse existing fields**: `heatBonusThreshold` adds value but always fires. We need equipment that *doesn't fire at all* outside its zone — a fundamentally different mechanic. Multi-fire is also new (cards can Repeat, but equipment can't inherently fire twice).

### 2. Combined draw+foresight via bonusForesight field

Add `bonusForesight?: number` to EquipmentDefinition. When present, the slot's foresight bonus is applied alongside the primary draw action. Used by Tactical Visor (draw 1 + foresight 1) and Neural Sync (draw 2 + foresight 1).

**Why**: Avoids creating a new composite action type. The draw action fires normally, and foresight is applied as a secondary effect.

### 3. Equipment table (final)

#### ARMS (Offense)
| Tier | Equipment | Effect | Archetype |
|------|-----------|--------|-----------|
| Common | Piston Arm | 6 dmg single | — |
| Common | Welding Torch | 3 dmg all | — |
| Uncommon | Overclocked Pistons | 8 dmg single, +1 heat | Slot tension |
| Uncommon | Shrapnel Launcher | 5 dmg all, lose 2 Block | Slot tension |
| Rare | Arc Welder | 5 dmg all + 1 Weak | Generalist |
| Rare | Cryo Cannon | 12 dmg single, only while Cool | Cool Runner |
| Rare | Meltdown Cannon | 4 dmg all, fires twice while Hot | Pyromaniac |

#### HEAD (Information)
| Tier | Equipment | Effect | Archetype |
|------|-----------|--------|-----------|
| Common | Basic Scanner | Draw 1 | — |
| Common | Cracked Lens | Foresight 1 | — |
| Uncommon | Calibrated Optics | Draw 1, draw 2 while Cool | Cool Runner (moved from rare) |
| Uncommon | Thermal Imager | Draw 2 | Generalist |
| Uncommon | Tactical Visor | Draw 1 + Foresight 1 | NEW generalist |
| Rare | Predictive Array | Draw 2 while Cool, draw 1 otherwise | Cool Runner |
| Rare | Neural Sync | Draw 2 + Foresight 1 | NEW generalist |
| Rare | Pyroclast Scanner | Draw 1, draw 3 while Hot | NEW Pyromaniac |

#### TORSO (Defense)
| Tier | Equipment | Effect | Archetype |
|------|-----------|--------|-----------|
| Common | Scrap Plating | 3 Block | — |
| Uncommon | Patched Hull | 2 Block + Heal 3 | Generalist |
| Uncommon | Reactive Plating | 5 Block | Generalist (keep) |
| Uncommon | Thermal Plating | 3 Block, 5 while Hot | Pyromaniac |
| Rare | Ablative Plates | 6 Block | NEW generalist |
| Rare | Cryo Shell | 4 Block, heal 2 while Cool | NEW Cool Runner |
| Rare | Heat Shield | 3 Block, +5 while Hot | Pyromaniac |

#### LEGS (Flow/Cooling)
| Tier | Equipment | Effect | Archetype |
|------|-----------|--------|-----------|
| Common | Worn Actuators | -1 Heat | — |
| Uncommon | Salvaged Treads | 2 Block + draw 1 | Generalist |
| Uncommon | Coolant Injector | -2 Heat (was -3) | Pure cooling |
| Uncommon | Adaptive Treads | -2 Heat, +1 Block/heat lost | Generalist |
| Rare | Stabilizer Treads | -1 Heat, +3 Block/heat lost | Generalist |
| Rare | Cryo Lock | -1 Heat, +5 Block while Cool | NEW Cool Runner |
| Rare | Thermal Exhaust | -1 Heat, -3 Heat while Hot | NEW Pyromaniac |

### 4. Coolant Injector nerf: -3 → -2

Coolant Injector at -3 heat is too powerful for Cool Runner — it alone offsets all execution heat (4 slots × +1 heat = +4, passive cooling 2 + injector 3 = 5 net cooling). At -2, total cooling is 4, which means you drift up by 1 per turn unless you also play cooling cards. This makes the choice between Coolant Injector and the new archetype LEGS meaningful.

## Risks / Trade-offs

- **[Cryo Cannon dead slot risk]** → If you leave Cool zone, your ARMS does nothing. That's the tradeoff — massive single target but requires commitment. Mitigated: player can see projected heat before executing.
- **[Meltdown Cannon AoE × 2 may be too strong]** → 4 × 2 = 8 AoE while Hot. Comparable to Arc Welder's 5 AoE + Weak. The zone requirement and 3/turn Hot penalty are the cost.
- **[New fields bloat EquipmentDefinition]** → Three new optional fields. Acceptable given they're all optional and serve distinct mechanics.
