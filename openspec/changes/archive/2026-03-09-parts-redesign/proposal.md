## Why

59% of behavioral parts are pure stat bumps ("+N damage when slot fires"). They don't change how players think or create build identity. Runs feel samey because parts don't redirect strategy.

Parts should be the equivalent of StS relics — the layer where build identity lives. Each part should make the player re-evaluate a decision they were already making.

## What Changes

- **Remove** 14 stat-bump and low-decision parts
- **Keep** 3 already-interesting parts (Reactive Frame, Flux Capacitor, Volatile Reactor)
- **Add** 14 new parts that define heat archetypes and create decision-making

### Parts being removed
Salvaged Plating, Tension Spring, Optical Expander, Cooling Fins, Reinforced Joints, Scavenger Lens, Heat Sink, Bypass Circuit, Thermal Buffer, Emergency Draw, Siphon Core, Hardened Frame, Frost Core, Overheater

### Parts being kept (unchanged)
- Reactive Frame (rare) — While Warm+, ARMS fires twice
- Flux Capacitor (rare) — Threshold cross → draw 1
- Volatile Reactor (rare) — Threshold cross → draw 1 + bonus damage

### New parts (17 total including 3 kept)

**Cool Runner archetype:**
- Cryo Engine (rare) — While Cool: gain 1 Block for each card you play
- Zero Point Field (uncommon) — At turn start, if Cool: cards cost 1 less Heat this turn (min 0)

**Warm Surfer archetype:**
- Gyro Stabilizer (rare) — While Warm: whenever you play a card, deal 2 damage to a random enemy

**Pyromaniac archetype (+ Reactive Frame):**
- Meltdown Core (rare) — While Hot: slot modifiers get +50% bonus to effect values
- Pressure Valve (uncommon) — When you would Overheat, instead set Heat to 8 and deal 5 damage to all enemies

**Oscillator archetype (+ Flux Capacitor, Volatile Reactor):**
- Thermal Oscillator (uncommon) — Threshold cross → gain 3 Block, deal 3 damage to all enemies

**Full Body secondary:**
- Momentum Core (uncommon) — If all 4 slots fire this turn, gain 3 Block and draw 1 card
- Salvage Protocol (uncommon) — Disabled slots generate 5 Block instead of doing nothing

**Exhaust Engine secondary:**
- Scrap Recycler (uncommon) — When a card is Exhausted, gain 4 Block
- Failsafe Armor (uncommon) — Start of turn: gain Block equal to cards in Exhaust pile

**Cross-archetype utility:**
- Ablative Shell (uncommon) — First hit each combat dealing 8+ damage is halved
- Feedback Loop (uncommon) — Assigning a modifier to a slot reduces Heat by 1
- Residual Charge (uncommon) — System cards also reduce Heat by 1
- Empty Chamber (uncommon) — End of planning: gain 2 Block per unplayed card in hand

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `combat-system`: New part effect types needed for the new parts' behaviors

## Impact

- `src/data/parts.ts` — replace part definitions
- `src/game/types.ts` — new PartTrigger and PartEffect variants
- `src/game/combat.ts` — handle new part effects in execution
- `src/data/enemies.ts` — update drop pool references to removed part IDs
- `src/components/CompendiumScreen.tsx` — updated part listings
