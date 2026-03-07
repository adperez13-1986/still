## Context

Players start with body equipment in 1 slot. The workshop "Extra Slot" upgrade fills a second. Previously Torso was default and Arms was the upgrade. Reinforced Chassis gave +15 permanent max HP for 50 shards.

## Goals / Non-Goals

**Goals:**
- New players immediately experience dealing damage through body slots
- Remove permanent HP scaling that reduces early-run tension
- Keep fragment bonuses as the per-run health adjustment lever

**Non-Goals:**
- Rebalancing enemy HP or damage values
- Changing base HP (remains 70)

## Decisions

### Arms as default starting equipment
Attack is the most intuitive first action in a roguelike. Starting cards (Emergency Shield, Coolant Flush) already cover defense. The body-slot system feels impactful from turn 1.

### Extra Slot upgrade grants Torso
The workshop upgrade now adds survivability (Scrap Plating: 3 Block) rather than damage. This is earned, not given.

### Remove Reinforced Chassis entirely
Permanent +15 HP flattens difficulty progression. Fragment bonuses (temporary, per-run) are a better lever for health adjustment.

## Risks / Trade-offs

- [Fragility] New players take more damage without Torso block → Acceptable: starting cards provide defense, and learning to use them is part of the game
- [Existing saves] Players who purchased Reinforced Chassis keep the flag in their save but it no longer does anything → Harmless: the upgrade key is simply unused
