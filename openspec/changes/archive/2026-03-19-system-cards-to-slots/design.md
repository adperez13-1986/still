## Context

Currently system cards are played instantly from hand — they don't interact with body slots. Slot modifiers are assigned to body slots and fire during execution. This creates two parallel systems where system cards bypass the core slot mechanic. HEAD and LEGS slots are almost never modified because their equipment effects (draw 1, cool 1) aren't worth a modifier card. After system cards exhaust, late combat devolves into "put best modifier on ARMS, execute."

## Goals / Non-Goals

**Goals:**
- System cards assigned to body slots (one per slot, home slot restricted)
- System cards fire instantly during planning (immediate resolution)
- System card on a slot overrides equipment for that turn
- All 4 slots have meaningful choices every turn
- Clean double-layer limiter: slots (how many) + heat (which ones)

**Non-Goals:**
- Redesigning system card effects or numbers
- New system cards
- Changing slot modifier mechanics (Amplify, Redirect, Repeat, Override)
- Changing equipment

## Decisions

### Home slot field on system cards

Add `homeSlot: BodySlot` to the system card category type:

```typescript
type ModifierCardType =
  | { type: 'slot'; modifier: ModifierCategory; effect: SlotModifierEffect }
  | { type: 'system'; modifier: SystemCategory; effects: SystemEffect[]; homeSlot: BodySlot }
```

The `homeSlot` determines which slot the system card can be assigned to. One card, one valid slot. The UI highlights only the home slot when a system card is selected.

### Home slot mapping

| Slot | System Cards | Theme |
|------|-------------|-------|
| HEAD | Diagnostics, Quick Scan, Thermal Surge, Overclock, Target Lock, Cold Efficiency, Heat Surge | Processing: draw, scan, analyze, compute |
| LEGS | Coolant Flush, Deep Freeze, Heat Vent, Thermal Flux, Thermal Equilibrium, Salvage Burst | Thermal: cooling, heat flow, venting |
| ARMS | Meltdown, Reckless Charge, Precision Strike, Glacier Lance, Flux Spike, Fuel the Fire, Controlled Burn | Weapons: direct damage, offensive bursts |
| TORSO | Field Repair, Failsafe Protocol, Armor Protocol | Chassis: structural defense, repair |

### Instant resolution during planning

When a system card is assigned to its home slot during planning:
1. Heat cost is applied (same as before)
2. Card effects resolve immediately (draw, damage, buff, etc.)
3. Card is moved to exhaust pile (same as before)
4. The slot is marked as "system card used" for this turn
5. The slot's equipment action does NOT fire during execution

Implementation: in `playModifierCard`, when the card type is `system`:
- Validate targetSlot matches homeSlot
- Apply effects immediately (existing system card effect logic)
- Set `slotModifiers[slot]` to a sentinel value (e.g., `'__system__'`) to mark the slot as occupied
- During `executeBodyActions`, skip any slot where `slotModifiers[slot] === '__system__'`

**Alternative considered**: Store system card info separately from slotModifiers. Rejected — using the existing slotModifiers field with a sentinel keeps the data model simple and the "slot is occupied" check consistent.

### Interaction with slot modifiers

A slot can have either:
- A system card (fires instantly, equipment skipped)
- A slot modifier (fires during execution, enhances equipment)
- Nothing (equipment fires default)

A slot CANNOT have both a system card and a slot modifier. The UI should prevent this — if a slot has a system card, it's grayed out for slot modifier assignment, and vice versa.

### HEAD equipment draw at turn start

HEAD equipment already draws at turn start (from previous change). This happens BEFORE planning. When a system card is assigned to HEAD during planning, the equipment draw already happened — the system card just prevents the HEAD equipment from firing AGAIN during execution (which it wouldn't for draw anyway, since we moved draw to turn start).

For HEAD equipment with non-draw effects (foresight), those fire during execution only if no system card is on HEAD. This is consistent — system card overrides equipment.

### Companion cards (Yanah, Yuri)

Yanah (heal + remove debuff) → TORSO home slot
Yuri (damage + Strength/Inspired) → HEAD home slot (utility/buff)

### Starting deck impact

Starting deck: 2x Boost, 1x Echo Protocol, 1x Emergency Strike, 1x Emergency Shield, 2x Coolant Flush, 1x Diagnostics

Turn 1 typical play:
- Assign Coolant Flush to LEGS → instantly cool -3 heat (LEGS equipment skipped)
- Assign Diagnostics to HEAD → instantly draw 2 (HEAD equipment skipped)
- Assign Boost to ARMS → queued for execution (+50% damage)
- Assign Emergency Shield to TORSO → queued for execution (12 Block override)
- 4 slots filled, 4 decisions, 4 remaining cards in hand unplayed

This is a massive improvement — every slot has a card, every assignment matters.

### Remove Cool passive block

The Cool passive block (+1 per unplayed card while Cool) is removed. It was a band-aid for HEAD/LEGS being dead slots. With all 4 slots demanding cards, the defensive floor comes from engaging with the slot system, not from holding cards.

## Risks / Trade-offs

- **System cards lose flexibility** — currently you can play 3 system cards per turn. With slots, max 4 (one per slot) but typically 1-2 because you also want slot modifiers. → This is intended. System cards are now precious choices, not spammable.
- **Home slot restricts where cards go** — Coolant Flush can ONLY go on LEGS. If LEGS already has a slot modifier, you can't cool this turn. → Creates real tension between cooling and LEGS modifier usage.
- **Complexity** — two card types with different behavior (instant vs queued). → Mitigated by clear UI distinction and the Charge/Rush mental model from Hearthstone.
- **No unassign** — we already removed unassign. System cards firing instantly on assignment means no take-backs, which is consistent.
