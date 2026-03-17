## Why

Still's combat suffers from "dead slots" — HEAD and LEGS are almost never worth modifying, making 2 of 4 body slots irrelevant. System cards are played instantly without interacting with the slot system, bypassing Still's core mechanic. Late combat (after system cards exhaust) becomes "put strongest modifier on ARMS, execute, repeat." The planning phase doesn't feel like programming a robot — it feels like playing one card.

This change unifies system cards into the slot system, giving every slot a meaningful choice every turn: a powerful one-time system card OR a reusable slot modifier. This creates 4 real decisions per turn and makes the double-layer limiting system work (slots limit how many, heat limits which).

## What Changes

- **BREAKING**: System cards are no longer instant-play. They are assigned to a specific body slot during planning, like slot modifiers.
- Each system card has a **home slot** based on its theme:
  - **HEAD**: Draw, buff, debuff (Diagnostics, Quick Scan, Thermal Surge, Overclock, Target Lock, Cold Efficiency, Heat Surge)
  - **LEGS**: Cooling, heat management (Coolant Flush, Deep Freeze, Heat Vent, Thermal Flux, Thermal Equilibrium, Salvage Burst)
  - **ARMS**: Direct damage (Meltdown, Reckless Charge, Precision Strike, Glacier Lance, Flux Spike, Fuel the Fire, Controlled Burn)
  - **TORSO**: Defense, heal (Field Repair, Failsafe Protocol, Armor Protocol)
- System cards fire **instantly during planning** when assigned (like Charge in Hearthstone) — the slot is occupied but the effect resolves immediately
- When a system card occupies a slot, the equipment's default action **does not fire** during execution for that slot (system card overrides it)
- Slot modifiers work unchanged — assigned to slots, fire during execution, enhance equipment
- A slot can hold either one system card OR one slot modifier, not both
- System cards still exhaust after use
- **Remove Cool passive block** — replaced by all 4 slots being relevant
- **Keep HEAD equipment draw at turn start** — HEAD equipment fires its draw bonus at turn start regardless (it's the default when no system card is assigned)

## Capabilities

### New Capabilities
- `system-card-slots`: System card slot assignment rules, home slot mapping, instant resolution during planning, equipment override behavior

### Modified Capabilities
- `modifier-cards`: System cards change from instant-play to slot-assigned. Card type system updated to include home slot.
- `body-actions`: Equipment action skipped when slot has a system card assigned. Execution phase only processes slots without system cards.

## Impact

- **Modify**: `src/game/types.ts` — add `homeSlot` field to system card category, or add `systemSlot` to `ModifierCardDefinition`
- **Modify**: `src/game/combat.ts` — `playModifierCard` handles system cards as slot assignments with instant resolution. `executeBodyActions` skips slots with system cards. Remove Cool passive block.
- **Modify**: `src/data/cards.ts` — add `homeSlot` to every system card definition
- **Modify**: `src/store/runStore.ts` — `playCard` routes system cards through slot assignment
- **Modify**: `src/components/BodySlotPanel.tsx` — show system card assignment on slots, validate home slot restrictions
- **Modify**: `src/components/Hand.tsx` — system cards appear in hand alongside slot modifiers, tapping a system card highlights only its home slot
- **Modify**: `src/components/CombatScreen.tsx` — remove Cool passive block logic
- **Modify**: `src/components/StillPanel.tsx` — remove `coolPassiveBlock` prop
