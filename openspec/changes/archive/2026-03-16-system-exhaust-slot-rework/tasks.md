## 1. System Card Exhaust

- [x] 1.1 In `playModifierCard` in `combat.ts`: when resolving a system card, always push to `exhaustPile` (bypass the `keywords.includes('Exhaust')` check for system cards). Fire `onCardExhaust` part triggers as usual.
- [x] 1.2 In `endTurn` in `combat.ts`: slot modifiers moved to discard/exhaust still use keyword-based logic (no change for slot modifiers). Verified system cards played mid-turn are already in exhaust pile and not double-processed.
- [x] 1.3 Remove Exhaust keyword from system card data in `cards.ts` where redundant (Deep Freeze, Quick Scan, Meltdown, Reckless Charge, Flux Spike, Salvage Burst). Resonance (slot modifier) keeps its Exhaust keyword.
- [x] 1.4 Update `CardDisplay.tsx`: system cards always show "Exhaust" label regardless of keywords array.

## 2. Slot Restrictions

- [x] 2.1 Add `getAllowedSlots` utility function in `combat.ts`: given a `ModifierCardDefinition`, return `BodySlot[] | null`. Derive from category: Amplify → Arms/Torso, Redirect → Arms, Override damage → Arms, Override block → Torso, Repeat → null (universal).
- [x] 2.2 Update `BodySlotPanel.tsx` `validSlots` computation: filter by `getAllowedSlots` — only allowed slots are highlighted.
- [x] 2.3 Update `test/BodySlotPanel.tsx` with same `validSlots` filter.
- [x] 2.4 Add validation in `playModifierCard` in `combat.ts`: reject if target slot not in allowed set.

## 3. Card Description Cleanup

- [x] 3.1 Remove "Exhaust." from descriptions of Quick Scan, Meltdown, Reckless Charge, Flux Spike, Salvage Burst. Resonance (slot modifier) keeps "Exhaust." in description.
- [x] 3.2 Reviewed all system card descriptions — clean, focused on effects.

## 4. Playtest

- [x] 4.1 Playtest sector 1 with system exhaust: verified, difficulty rebalanced (damage scaling 15%→8%, mid-turn reshuffle enabled, all slots start equipped)
- [x] 4.2 Playtest slot restrictions: verified working
- [x] 4.3 Playtest Failsafe Armor interaction: Scrap Recycler synergy confirmed strong
- [x] 4.4 Playtest full run: completed with generic stat-stack build — survivable, pacing works
