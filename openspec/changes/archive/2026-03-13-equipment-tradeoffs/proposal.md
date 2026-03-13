## Why

Equipment is currently pure-upside linear upgrades — rarer always beats common with no real decision. This makes equipment drops feel routine rather than meaningful. Builds naturally gravitate toward Cool Runner because staying Cool requires no active effort — passive cooling and low-cost cards keep you there by default. Pyromaniac needs equipment that commits to the Hot zone and rewards staying there. LEGS cooling actually helps both archetypes (Cool stays Cool, Hot avoids overheat), but there's no equipment that defines *how* you use each slot for your archetype. Equipment should create archetype-defining decisions, not just stat bumps.

## What Changes

- **Add 11 new equipment pieces** across all 4 slots with tradeoff mechanics:
  - Uncommons with slot tension (B-style): powerful but pressure other slots (+1 heat, lose Block)
  - Rares with build-around constraints (C-style): "only while Cool", "fires twice while Hot"
- **Reclassify some existing equipment** — adjust rarity/stats to fit the new tiered structure
- **New equipment mechanics**: conditional-only firing (Cryo Cannon), multi-fire while in zone (Meltdown Cannon), Block loss on fire (Shrapnel Launcher), combined draw+foresight
- **Pyromaniac LEGS option** — Thermal Exhaust: -1 heat normally, -3 heat while Hot. Enables Hot builds to manage heat without overcooling

## Capabilities

### New Capabilities
- `equipment-tradeoffs`: Equipment definitions with tradeoff mechanics including slot tension, heat-conditional bonuses, and archetype-gating

### Modified Capabilities
- `body-actions`: New equipment mechanics require extending how slot actions resolve — conditional firing, Block loss on fire, combined draw+foresight actions

## Impact

- `src/data/parts.ts` — Add 11 new equipment definitions, reclassify existing ones
- `src/game/combat.ts` — Extend `resolveBodyAction` for new mechanics (conditional-only, multi-fire, Block loss)
- `src/game/types.ts` — May need new fields on EquipmentDefinition for conditional-only and multi-fire
- `src/game/drops.ts` — Equipment pool grows; may want sector-based equipment pools
