## 1. Data Model

- [x] 1.1 Add `homeSlot: BodySlot` to the system card category type in `types.ts`
- [x] 1.2 Add `homeSlot` to every system card definition in `cards.ts` — HEAD: Diagnostics, Quick Scan, Thermal Surge, Overclock, Target Lock, Cold Efficiency, Heat Surge. LEGS: Coolant Flush, Deep Freeze, Heat Vent, Thermal Flux, Thermal Equilibrium, Salvage Burst. ARMS: Meltdown, Reckless Charge, Precision Strike, Glacier Lance, Flux Spike, Fuel the Fire, Controlled Burn. TORSO: Field Repair, Failsafe Protocol, Armor Protocol.
- [x] 1.3 Add `homeSlot` to companion cards — Yanah → TORSO, Yuri → HEAD

## 2. System Card Slot Assignment

- [x] 2.1 Update `playModifierCard` in `combat.ts`: when card type is `system`, validate targetSlot matches homeSlot, resolve effects immediately, mark slot with sentinel `'__system__'` in slotModifiers, exhaust the card
- [x] 2.2 Update `getAllowedSlots` in `combat.ts`: for system cards return `[card.category.homeSlot]`
- [x] 2.3 System cards require targetSlot — removed instant-play path, system cards now go through slot assignment

## 3. Execution Phase

- [x] 3.1 Update `executeBodyActions` in `combat.ts`: skip slots where `slotModifiers[slot] === '__system__'`
- [x] 3.2 `endTurn` already clears slotModifiers to null — sentinel `'__system__'` handled correctly (findAssignedCard returns undefined, no card to move)

## 4. Remove Cool Passive Block

- [x] 4.1 Remove Cool passive block from `executeBodyActions` in `combat.ts`
- [x] 4.2 Remove `coolPassiveBlock` calculation from `CombatScreen.tsx`
- [x] 4.3 Remove `coolPassiveBlock` prop from `StillPanel.tsx` and its display logic

## 5. UI Updates

- [x] 5.1 Update `BodySlotPanel.tsx` validSlots: system cards only allow homeSlot. Slot modifiers exclude `'__system__'` occupied slots.
- [x] 5.2 Update `BodySlotPanel.tsx` display: show "⚡ System" on system-card-occupied slots
- [x] 5.3 Update `CardDisplay.tsx`: system cards show home slot name instead of "System" in category badge
- [x] 5.4 Update `test/BodySlotPanel.tsx` with same validSlots changes

## 6. HEAD Turn-Start Draw

- [x] 6.1 HEAD equipment draw at turn start already works regardless (from previous change) — no changes needed

## 7. Playtest

- [ ] 7.1 Verify system cards can only be assigned to home slot
- [ ] 7.2 Verify system card effects fire instantly on assignment
- [ ] 7.3 Verify equipment skipped for slots with system cards during execution
- [ ] 7.4 Verify slot modifiers can't go on system-card-occupied slots and vice versa
- [ ] 7.5 Verify all 4 slots feel relevant — real decisions each turn
- [ ] 7.6 Verify starting deck turn 1: Coolant Flush→LEGS, Diagnostics→HEAD, modifier→ARMS, modifier→TORSO
