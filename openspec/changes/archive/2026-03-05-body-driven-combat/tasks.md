## 1. Type System Rework

- [x] 1.1 Define `HeatState` type with `current`, `max` (10), and threshold helpers (`isCool`, `isWarm`, `isHot`, `isOverheat`) in `types.ts`
- [x] 1.2 Define `BodySlot` enum (`Head`, `Torso`, `Arms`, `Legs`) and `BodyAction` interface (`slot`, `baseValue`, `actionType`, `targetMode`) in `types.ts`
- [x] 1.3 Define `EquipmentDefinition` interface — replaces `EquipableDefinition` — with `slot`, `name`, `description`, `action: BodyAction`, `rarity` in `types.ts`
- [x] 1.4 Define `ModifierCategory` type (`Amplify` | `Redirect` | `Repeat` | `Override`) and `SystemCategory` type (`Cooling` | `Draw` | `Conditional`) in `types.ts`
- [x] 1.5 Redefine `CardDefinition` as `ModifierCardDefinition` with `heatCost` (number, can be negative), `category` (slot modifier or system), `slotTarget` (optional), and `effect` in `types.ts`
- [x] 1.6 Define `BehavioralPartDefinition` interface — replaces `PartDefinition` — with `trigger` condition and `effect` in `types.ts`
- [x] 1.7 Update `CombatState` to include `heat: number`, `shutdown: boolean`, `slotModifiers: Record<BodySlot, ModifierCardDefinition | null>`, remove `energy` field
- [x] 1.8 Update `RunState` to replace `energyCap` with Heat-related fields, replace `equipables` with `equipment: Record<BodySlot, EquipmentDefinition | null>`, replace `parts` array type
- [x] 1.9 Update `EnemyDefinition` intent types — add `HeatAttack`, `DisableSlot`, `Absorb` to `IntentType`
- [x] 1.10 Remove energy-related types: `CardType` (Attack/Skill/Power), old `EquipableDefinition`, old `PartEffectType`
- [x] 1.11 Update `CombatState` to include `disabledSlots: Set<BodySlot>` for enemy DisableSlot intent tracking

## 2. Combat Engine Rewrite

- [x] 2.1 Implement `applyPassiveCooling(heat: number): number` — subtract 2, clamp to 0
- [x] 2.2 Implement `getHeatThreshold(heat: number): 'Cool' | 'Warm' | 'Hot' | 'Overheat'` helper
- [x] 2.3 Implement `getThresholdBonus(heat: number): number` — returns 0/1/2 based on threshold
- [x] 2.4 Implement `resolveBodyAction(slot, equipment, modifier, heat, enemies, parts): ActionResult` — resolves one slot's action with modifier and threshold bonus applied
- [x] 2.5 Implement `executeBodyActions(combatState, equipment, modifiers, parts): CombatResult` — iterates HEAD→TORSO→ARMS→LEGS, calling `resolveBodyAction` for each filled slot, accumulating Heat per action
- [x] 2.6 Implement modifier application logic within `resolveBodyAction`: Amplify (multiply output), Redirect (change target), Repeat (fire again, +1 Heat per extra firing from body-action rule), Override (replace action — no Strength/Dexterity bonus on overrides)
- [x] 2.7 Implement `playModifierCard(combatState, card, targetSlot?): CombatState` — assigns slot modifier or applies system card, updates Heat
- [x] 2.8 Implement `executeEnemyTurn` updated for new intent types: existing Attack/Block/Buff/Debuff + new HeatAttack (damage + Heat), DisableSlot (disable a slot for 1 turn), Absorb (enemy gains Block = portion of Still's Heat)
- [x] 2.9 Implement Overheat shutdown logic: if Heat reaches 10, set `shutdown: true` for next turn; on shutdown turn, skip body actions, allow only system cards; after shutdown turn, reset Heat to 5
- [x] 2.10 Implement Hot penalty: deal 3 damage to Still at end of turn when Heat is 8-9
- [x] 2.11 Implement `initCombat` rewrite: shuffle modifier deck, draw hand of 4, set Heat to 0, no energy
- [x] 2.12 Implement end-of-turn following canonical step order: Hot penalty (3 dmg if Heat 8-9), decrement status durations, discard remaining hand, check win/loss. Block resets at START of next turn (step 2), not end of current turn
- [x] 2.14 Implement status effect mapping to body actions: Strength adds to ARMS damage, Dexterity adds to TORSO Block, Weak reduces ARMS damage by 25%, Inspired draws extra modifier cards next turn (replaces old +1 energy). Override actions do not receive Strength/Dexterity bonuses
- [x] 2.15 Implement slot disable logic: disabled slots skip execution, cannot receive modifiers, recover automatically at start of following turn
- [x] 2.13 Implement `projectHeat(current, filledSlots, assignedModifiers): number` — pure function for UI projection

## 3. Data Definitions

- [x] 3.1 Define Act 1 equipment for HEAD slot: Basic Scanner (draw 1 card), Cracked Lens (reveal 1 extra enemy intent)
- [x] 3.2 Define Act 1 equipment for TORSO slot: Scrap Plating (gain 3 Block), Patched Hull (gain 2 Block + heal 3 HP)
- [x] 3.3 Define Act 1 equipment for ARMS slot: Piston Arm (deal 6 damage to one enemy), Welding Torch (deal 3 damage to ALL enemies)
- [x] 3.4 Define Act 1 equipment for LEGS slot: Worn Actuators (lose 1 Heat), Salvaged Treads (gain 2 Block + draw 1 card)
- [x] 3.5 Define starting modifier deck: 3x Boost (+1H, Amplify +50%), 2x Emergency Strike (+2H, Override deal 8 damage), 2x Coolant Flush (-3H), 1x Diagnostics (+1H, draw 2)
- [x] 3.6 Define Act 1 modifier card pool (~12-15 cards): mix of Amplify, Redirect, Repeat, Override, Cooling, Draw, and Conditional cards with varied Heat costs
- [x] 3.7 Define Act 1 behavioral parts (~6-8 parts): conditional triggers tied to body actions, Heat state, and modifier play (e.g., "when TORSO fires, gain +2 Block", "when Warm+, ARMS fires twice")
- [x] 3.8 Update Act 1 enemy definitions to work with new combat model — keep existing enemies but ensure intents resolve correctly against body-action combat loop
- [x] 3.9 Update Act 1 elite and boss definitions — same approach, verify intent patterns work
- [x] 3.10 Update enemy drop pools to reference new modifier cards, equipment, and behavioral parts
- [x] 3.11 Define companion modifier cards: Yanah (System/Draw, +1H, draw 2 + gain 1 Inspired) and Yuri (System/Cooling, +0H, heal 6 + remove 1 debuff)

## 4. Store Updates

- [x] 4.1 Update `runStore.ts` — replace `energyCap` with Heat fields, replace `equipables` with `equipment: Record<BodySlot, EquipmentDefinition | null>`, replace `parts` with behavioral parts array
- [x] 4.2 Update run initialization in store to set starting state: Torso equipped with Scrap Plating, 8-card modifier deck, Heat 0, empty HEAD/ARMS/LEGS
- [x] 4.3 Update combat start flow in store to call new `initCombat` (no energy param, Heat at 0, draw 4 modifiers)
- [x] 4.4 Update card play flow to call `playModifierCard` instead of old `playCard` — handle slot targeting and Heat cost
- [x] 4.5 Update end-turn flow to call `executeBodyActions` then `executeEnemyTurn` then apply Hot penalty and Overheat check
- [x] 4.6 Update post-combat reward flow for new drop types (equipment, modifier cards, behavioral parts)
- [x] 4.7 Update `permanentStore.ts` to store `passiveCoolingBonus` from Fragment screen, remove `energyCap` from run init

## 5. Combat UI Rework

- [x] 5.1 Build `HeatTrack` component — visual bar 0-10 with color-coded threshold zones (blue Cool, yellow Warm, orange Hot, red Overheat), current value indicator, and projected end-of-turn value
- [x] 5.2 Build `BodySlotPanel` component — shows 4 slots vertically (HEAD→TORSO→ARMS→LEGS), each displaying equipped item name, base action description, assigned modifier (if any), and empty/disabled state
- [x] 5.3 Rework `Hand.tsx` — display modifier cards with Heat cost (instead of energy), modifier category icon, and slot-targeting interaction (click card, then click slot to assign)
- [x] 5.4 Rework `CombatScreen.tsx` planning phase — show BodySlotPanel, HeatTrack with projection, Hand, and "Execute" button (replaces "End Turn")
- [x] 5.5 Implement modifier assignment UX: click modifier card in hand → if slot modifier, highlight valid slots → click slot to assign → card attaches to slot, Heat projection updates
- [x] 5.6 Implement modifier unassign UX: click assigned modifier on a slot → return to hand, refund Heat projection
- [x] 5.7 Rework execution phase display — sequential slot-by-slot resolution with brief visual feedback (damage numbers, Block gained, Heat increments)
- [x] 5.8 Update `StillPanel.tsx` — show Health, Heat track, active behavioral parts, and equipped body slots summary
- [x] 5.9 Update `CardDisplay.tsx` — show Heat cost (flame icon + number, or snowflake for negative), modifier category, and whether it targets a slot or is a system card
- [x] 5.10 Update reward screens (RewardScreen, ShopScreen) to handle equipment drops alongside modifier cards and parts
- [x] 5.11 Add disabled-slot visual state to `BodySlotPanel` — distinct from empty (shows lock/jam icon, recovers next turn indicator)

## 6. Integration and Non-Combat Updates

- [x] 6.1 Update `RestScreen.tsx` — "upgrade a card" now upgrades a modifier card (same flow, different card type display)
- [x] 6.2 Update `ShopScreen.tsx` — sell equipment items alongside modifier cards and behavioral parts; remove old equipable/part formats
- [x] 6.3 Update `RunInfoOverlay.tsx` — show modifier deck, equipped body slots, and active behavioral parts instead of old deck/equips view
- [x] 6.4 Update companion card injection in `RunScreen.tsx` — inject Yanah/Yuri modifier card definitions into starting deck when unlocked
- [x] 6.5 Update map enemy spawning (`pickEnemiesForRoom`) to work with updated enemy definitions
- [x] 6.6 Update Workshop upgrades: "Reinforced Chassis" (+15 max health, unchanged), "Practiced Routine" (add random Act 1 modifier to starting deck), "Sharp Eye" (shard bonus, unchanged), "Fragment Reservoir" (cap extension, unchanged), "Extra Slot" (pre-equip basic Piston Arm in ARMS slot)
- [x] 6.7 Update Fragment bonuses: replace `energyCap` / "Overcharged" with `passiveCooling` / "Cooled Start" (+1 passive cooling for first 3 turns). Verify health/shards/drawCount bonuses apply correctly to new run state shape
- [x] 6.8 Update `CarrySelectOverlay.tsx` — display behavioral part trigger descriptions instead of old stat-effect descriptions for carried part selection
- [x] 6.9 Update `permanentStore.ts` carried part format to use `BehavioralPartDefinition` — broken parts deactivate behavioral triggers, repair reactivates them

## 7. Cleanup

- [x] 7.1 Remove old `playCard` and `executeEnemyTurn` from `combat.ts`
- [x] 7.2 Remove old card definitions (Strike, Brace, Surge, etc.) from `data/cards.ts`
- [x] 7.3 Remove old part stat-effect definitions from `data/parts.ts`
- [x] 7.4 Remove old equipable definitions from `data/parts.ts`
- [x] 7.5 Remove `CardType`, `PartEffectType`, old `EquipableDefinition` and related dead types from `types.ts`
- [x] 7.6 Remove energy references from all UI components and store logic
