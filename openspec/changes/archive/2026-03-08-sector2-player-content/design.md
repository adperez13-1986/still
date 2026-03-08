## Overview

S2 player content answers the challenges S2 enemies create. Enemies disable slots and punish heat — so players get cards/parts that work around disabled slots, exploit heat transitions, and offer stronger scaling.

## S2 Card Pool (~10-12 cards)

Design principles:
- S1 cards teach the basics. S2 cards reward mastery of a specific heat strategy.
- Some cards work BETTER when slots are disabled (turning enemy disruption into opportunity)
- Stronger effects than S1 but with higher heat costs or drawbacks

### Card Ideas

**Slot-disruption answers:**
- **Reroute** — Override: redirect a disabled slot's action to another slot. Heat 1.
- **Failsafe Protocol** — System: If any slot is disabled, gain 8 Block and draw 1. Heat 0.

**Heat exploitation (deepening archetypes):**
- **Glacier Lance** — System: Deal 10 damage. While Cool: deal 16 and apply 1 Weak. Heat 0. (Cool Runner)
- **Controlled Burn** — System: Gain 3 Strength. While Hot: also gain 2 Dexterity. Heat 2. (Pyromaniac)
- **Flux Spike** — System: Deal damage equal to 2x heat change this turn. Exhaust. Heat 0. (Oscillator)
- **Thermal Equilibrium** — Cooling: Reduce Heat by 3. Gain Block equal to Heat before cooling. Heat -3. (Oscillator)

**Scaling/utility:**
- **Armor Protocol** — System: Gain 2 Dexterity. Heat 1.
- **Salvage Burst** — System: Draw 3 cards. Reduce Heat by 1. Exhaust. Heat -1.
- **Cascade** — Repeat: Slot fires 3 times. Heat 4. (high risk/reward)
- **Resonance** — Amplify: +200% to one slot. Exhaust. Heat 3.

**New keyword potential:**
- **Retain** cards (already in Keyword type) — cards that stay in hand between turns. S2 could introduce the first Retain cards.

## S2 Equipment

Stronger baseline, some with drawbacks:

| Slot | Name | Effect | Rarity | Notes |
|------|------|--------|--------|-------|
| Head | Thermal Imager | Draw 2 cards | uncommon | Straight upgrade over Basic Scanner |
| Head | Predictive Array | Draw 1 + foresight 2 | rare | See deeper into enemy patterns |
| Torso | Reactive Plating | Gain 5 Block | uncommon | |
| Torso | Heat Shield | Gain 3 Block. While Hot: gain 7. | rare | Pyromaniac synergy |
| Arms | Plasma Cutter | Deal 10 damage | uncommon | |
| Arms | Arc Welder | Deal 5 damage to ALL + apply 1 Weak | rare | AoE + debuff |
| Legs | Coolant Injector | Lose 2 Heat | uncommon | |
| Legs | Stabilizer Treads | Lose 1 Heat + gain 3 Block | rare | Defensive cooling |

## S2 Behavioral Parts

Parts that respond to S2 mechanics:

| Name | Trigger | Effect | Rarity |
|------|---------|--------|--------|
| Bypass Circuit | onSlotFire (any) | When a slot is disabled, other slots deal +3 damage | uncommon |
| Thermal Buffer | onHeatThreshold (Hot) | While Hot: gain +3 Block at turn start | uncommon |
| Emergency Draw | onTurnStart | When any slot is disabled: draw 1 extra card | rare |
| Siphon Core | onSlotFire (Legs) | When Legs fires: heal 2 HP | uncommon |
| Hardened Frame | onTurnStart | At turn start: if block > 0, gain +2 block | uncommon |
| Volatile Reactor | onThresholdCross | When heat crosses a threshold: deal 5 damage to all enemies | rare |

## Sector-Aware Rewards

- Card rewards from combat: S1 rooms offer `SECTOR1_CARD_POOL`, S2 rooms offer `SECTOR2_CARD_POOL`
- Shop: offerings pull from current sector's pools
- Staging area bonus: pulls from next sector's pools
- Mixed pools are fine (S1 cards can still appear in S2 via existing deck, just new rewards are S2)

## Integration with S2 Enemy Drop Pools

Once S2 content IDs are defined, update S2 enemy drop pools in `src/data/enemies.ts` to reference them instead of S1 placeholders.
