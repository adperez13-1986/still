## Context

The exhaust archetype has two defensive payoffs (Scrap Recycler: +2 block per exhaust event, Failsafe Armor: block = exhaust pile size at turn start) but zero offensive scaling. System cards auto-exhaust on play, naturally growing the pile at ~2-3 cards/turn. The build needs an offensive mirror to Failsafe Armor to become a viable standalone strategy.

S1 currently has 4 parts: Frost Core, Scrap Recycler, Ablative Shell, Thorns Core. Adding a 5th gives more variety and seeds the exhaust offensive identity early.

## Goals / Non-Goals

**Goals:**
- Add one S1 uncommon part that provides scaling damage based on exhaust pile size
- The part should feel like a natural pair with Scrap Recycler (found in same sector)
- Combined with Failsafe Armor in S2, the exhaust build has both offense and defense scaling

**Non-Goals:**
- No new cards, equipment, or fuel mechanics
- No changes to the exhaust/system card rules
- Not trying to make exhaust as strong as stat stacking — just viable as a third path

## Decisions

### Part design: "Slag Compressor" — bonus Arms damage equal to exhaust pile size

**Trigger**: `onSlotFire` for Arms slot
**Effect**: new type `damagePerExhausted` — adds bonus damage equal to `exhaustPile.length` when Arms fires

Rationale:
- Mirrors Failsafe Armor exactly (pile size → block becomes pile size → damage)
- Scoped to Arms only (not all slots) to keep it from being too broadly powerful
- Grows at the same rate as Failsafe Armor's block, maintaining balance between offense and defense
- `onSlotFire` trigger with `slot: 'Arms'` is consistent with existing Reactive Frame pattern

Alternatives considered:
- `onCardExhaust` trigger dealing flat damage per event (like Scrap Recycler mirrors): rejected because it would trigger multiple times per turn (2-3 damage pings) rather than one clean scaling number. Harder to read.
- Global damage bonus to all slots: too strong, would double-dip with Repeat/Amplify on every slot.
- Damage to random enemy at turn start: disconnected from the slot system, doesn't interact with modifiers.

### Rarity: Uncommon

Matches Scrap Recycler and Failsafe Armor. The exhaust build is assembled from uncommon parts — no single rare chase piece needed. The rarity of the build comes from finding multiple synergistic uncommon parts.

## Risks / Trade-offs

- [Exhaust pile grows unboundedly] → Damage scales forever, but slowly (~2-3/turn). By turn 10, +12 damage is strong but not broken compared to stat stacking with Amplify/Repeat. The natural slot and energy brakes prevent degenerate growth.
- [Stacks with Repeat/Amplify on Arms] → This is intentional. Stat stacking gets to use Amplify too. If it proves too strong, the bonus could be capped or made non-multipliable in a future pass.
- [S1 part pool grows to 5] → Minor concern. One more option in the pool is fine.
