## Approach

Many new parts don't fit the current `trigger → effect` model. The existing system assumes every part is "when X happens, apply Y" with simple numeric effects. The redesigned parts need richer behaviors:

- **Cryo Engine**: passive that checks heat zone on every card play → needs `onCardPlay` trigger + conditional Block
- **Zero Point Field**: modifies card costs for the whole turn → needs a pre-turn modifier system or a flag combat checks
- **Gyro Stabilizer**: deals damage on card play while in a zone → needs `onCardPlay` trigger + damage effect
- **Pressure Valve**: intercepts overheat → needs `onWouldOverheat` trigger that replaces the overheat behavior
- **Meltdown Core**: modifies slot modifier effect values → needs a multiplier applied during execution
- **Momentum Core**: checks post-execution whether all 4 fired → needs `onAllSlotsFired` trigger
- **Salvage Protocol**: modifies disabled slot behavior → checked during body action execution
- **Scrap Recycler**: triggers on exhaust → needs `onCardExhaust` trigger
- **Failsafe Armor**: turn start, scales with exhaust pile size → needs dynamic value in effect
- **Ablative Shell**: intercepts large damage → needs `onDamageTaken` trigger with threshold
- **Feedback Loop**: triggers on modifier assignment → needs `onModifierAssign` trigger
- **Residual Charge**: triggers on system card play → needs `onSystemCardPlay` trigger
- **Empty Chamber**: triggers at end of planning → needs `onPlanningEnd` trigger

### Type system changes

Rather than adding 8+ new trigger types to the existing union, switch to a **passive part** model. Keep `BehavioralPartDefinition` but make the trigger/effect more flexible:

**New triggers needed:**
- `onCardPlay` — any card played
- `onCardExhaust` — card exhausted
- `onModifierAssign` — slot modifier assigned
- `onWouldOverheat` — intercepts overheat
- `onPlanningEnd` — after player clicks Execute, before body actions
- `onDamageTaken` — when Still takes damage

**New effects needed:**
- `blockPerCard` — gain N Block (used with onCardPlay)
- `damageRandomEnemy` — deal N damage to random enemy
- `reduceCardHeatCosts` — reduce heat costs this turn by N
- `preventOverheat` — set heat to value, deal damage to all
- `amplifyModifiers` — multiply modifier effect values by N
- `blockForDisabledSlots` — gain N Block per disabled slot (checked during execution)
- `blockPerExhausted` — gain Block equal to exhaust pile size
- `halveLargeDamage` — halve damage above threshold (once per combat)
- `blockPerUnplayedCard` — gain N Block per unplayed card in hand

Some of these don't fit trigger/effect cleanly — they're more like **combat rules that are active while the part is owned**. The implementation should check for specific part IDs at the relevant points in combat.ts rather than trying to route everything through a generic trigger system.

### Implementation strategy

1. Update `PartTrigger` and `PartEffect` types with new variants
2. Replace part definitions in `parts.ts`
3. Add hook points in `combat.ts` at each relevant moment (card play, exhaust, overheat check, modifier assignment, planning end, damage intake)
4. Each hook point checks if the player has a part with the matching trigger and applies the effect
5. Update enemy drop pools to reference new part IDs
6. Update compendium

### Sector distribution

**Sector 1 pool (8 parts — simpler, seed archetypes):**
- Feedback Loop (uncommon) — modifier assign → -1 Heat
- Residual Charge (uncommon) — system cards → -1 Heat
- Scrap Recycler (uncommon) — exhaust → +4 Block
- Ablative Shell (uncommon) — halve first big hit
- Momentum Core (uncommon) — all 4 slots fire → +3 Block, draw 1
- Pressure Valve (uncommon) — overheat → set 8, AOE 5
- Reactive Frame (rare, KEEP) — Warm+ → ARMS fires twice
- Flux Capacitor (rare, KEEP) — threshold cross → draw 1

**Sector 2 pool (9 parts — archetype-defining, stronger):**
- Zero Point Field (uncommon) — Cool → cards cost -1 Heat
- Salvage Protocol (uncommon) — disabled slots → 5 Block each
- Thermal Oscillator (uncommon) — threshold cross → 3 Block + 3 AOE damage
- Empty Chamber (uncommon) — unplayed cards → 2 Block each
- Failsafe Armor (uncommon) — turn start → Block = exhaust pile size
- Cryo Engine (rare) — Cool + card play → 1 Block per card
- Gyro Stabilizer (rare) — Warm + card play → 2 damage to random enemy
- Meltdown Core (rare) — Hot → modifier effects +50%
- Volatile Reactor (rare, KEEP) — threshold cross → draw 1 + bonus damage
