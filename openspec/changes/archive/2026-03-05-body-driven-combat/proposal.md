## Why

Combat currently plays as a simpler Slay the Spire — every enemy is a cycling intent list, every card is "deal X / block Y," and parts are stat sticks with no mechanical presence. Still's robot identity is purely cosmetic. Reworking combat so the body generates actions and cards modify them makes the robot construction the core of the game, not decoration. Heat as a central resource creates a uniquely robotic tension (managing your own machine) that no card game offers.

## What Changes

- **BREAKING**: Replace the card-as-action combat model with a body-driven model where equipped body parts (HEAD, TORSO, ARMS, LEGS) generate automatic actions each turn
- **BREAKING**: Redefine cards as "modifier/subroutine" cards that amplify, redirect, repeat, override, or cool body actions rather than being standalone actions
- **BREAKING**: Replace the energy resource system with a Heat system — body actions and modifier cards generate Heat; Heat thresholds (Cool/Warm/Hot/Overheat) create risk/reward dynamics
- **BREAKING**: Rework all existing card definitions from standalone actions to modifier/system cards
- **BREAKING**: Rework equipment from stat sticks to action generators — each filled slot produces a specific action every turn
- **BREAKING**: Rework parts from stat bonuses to body-interaction modifiers (parts that change how body actions or cards behave)
- Add projected Heat display that updates in real-time as the player plans modifier assignments
- Redesign Still's starting state: begin with only a Torso slot filled, reinforcing the "build yourself" arc
- Add passive Heat cooling (−2 per turn) and per-slot Heat generation (+1 per body action)

## Capabilities

### New Capabilities
- `heat-system`: The Heat resource track, thresholds (Cool 0-4 / Warm 5-7 / Hot 8-9 / Overheat 10), passive cooling, Heat generation from body actions and modifier cards, shutdown mechanic on Overheat
- `modifier-cards`: The new card system — slot modifiers (Amplify, Redirect, Repeat, Override) that target body actions, and system cards (Cooling, Draw/Cycling, Conditional) that affect global state
- `body-actions`: Equipment-driven automatic actions per turn — each filled slot generates a domain-specific action (HEAD=information, TORSO=durability, ARMS=output, LEGS=flow), execution order, and interaction with Heat and modifiers

### Modified Capabilities
- `card-system`: Cards are no longer standalone actions — they become modifiers and system cards with Heat costs instead of energy costs. Card types (Attack/Skill/Power), the energy cost system, and the starting deck all change fundamentally
- `protagonist`: Still's starting state changes (start with only Torso filled, no Arms/Head/Legs). Equipment slots become action generators, not stat containers. Parts reworked from stat bonuses to behavioral modifiers
- `enemy-system`: Enemy intents and behavior need to interact with the new body-action and Heat systems (e.g., enemies that generate Heat, disable slots, or react to player's Heat state)
- `game-core`: The turn-based combat loop changes — player phase becomes a planning phase (assign modifiers to slots), followed by an execution phase (body acts top-to-bottom), then enemy phase
- `progression`: Workshop "Extra Slot" upgrade redefined for body-driven model (pre-equips basic ARMS). Fragment bonus "Overcharged" (+1 energy) replaced with "Cooled Start" (+1 passive cooling for 3 turns). "Practiced Routine" adds a random Act 1 modifier card to starting deck
- `carried-part`: Carried parts use behavioral triggers instead of stat effects. Broken parts deactivate behavioral triggers instead of removing stat bonuses
- `narrative`: Companion cards (Yanah, Yuri) reworked as system modifier cards with Heat costs

## Impact

- `src/game/combat.ts` — Complete rewrite: new turn structure (plan → execute → enemy), Heat tracking, body action resolution, modifier application
- `src/game/types.ts` — New types for Heat state, body actions, modifier cards, slot targeting; rework CardDefinition, CardEffect, EquipableDefinition, CombatState, RunState
- `src/data/cards.ts` — Full replacement: all existing cards become modifier/system cards with Heat costs
- `src/data/parts.ts` — Rework parts from stat effects to behavioral modifiers; rework equipables from stat+skill to action generators
- `src/data/enemies.ts` — Update enemy definitions to work with new combat model (future change can expand enemy behaviors)
- `src/components/CombatScreen.tsx` — Major UI rework: show body action queue, modifier assignment UI, projected Heat display, execution animation
- `src/components/Hand.tsx`, `CardDisplay.tsx` — Update to show modifier cards with Heat costs and slot targeting
- `src/components/StillPanel.tsx` — Show Heat track, body slot status, equipped actions
- `src/store/runStore.ts` — Update run state shape for Heat, body actions, modifier hand
