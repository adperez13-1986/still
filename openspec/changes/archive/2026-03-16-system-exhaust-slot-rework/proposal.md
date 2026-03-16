## Why

With enough draw and cooling cards, players can play every card every turn. Heat — the game's central resource — stops being a constraint. Combat devolves into "play everything, execute," removing the planning puzzle that makes Still's body slot system unique. The slot modifier system is also underused: most modifiers are pure math (amplify a number), some can be assigned to slots where they have no meaningful effect (Spread Shot on HEAD), and system cards vastly outnumber slot modifiers in most decks.

## What Changes

- **BREAKING**: All system cards now exhaust on play (removed from deck for the rest of combat). Each system card becomes a one-time moment — Coolant Flush, Diagnostics, Thermal Surge are all precious plays. Late combat shifts toward a pure slot modifier puzzle.
- **BREAKING**: Slot modifier restrictions by category:
  - **Amplify** (Boost, Overcharge, Resonance): restricted to **ARMS/TORSO** only — multiplying small HEAD/LEGS values is meaningless
  - **Redirect** (Spread Shot): restricted to **ARMS** only — "target all" only makes sense for damage
  - **Override: damage** (Emergency Strike, Shield Bash, Precision Strike, Reckless Charge): restricted to **ARMS** only
  - **Override: block** (Emergency Shield, Armor Protocol): restricted to **TORSO** only
  - **Repeat** (Echo Protocol, Cascade): stays **universal** — double draw (HEAD), double block (TORSO), double damage (ARMS), double cooling (LEGS) are all strong plays
- Review HEAD and LEGS equipment to ensure Repeat on those slots feels impactful — equipment with low base values may need buffing
- Starting deck update: starting system cards (Coolant Flush, Diagnostics) now exhaust, affecting early combat pacing

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `modifier-cards`: System cards gain universal Exhaust behavior. Slot modifier cards gain slot restrictions by category.
- `body-actions`: Slot assignment validation — reject restricted modifiers on invalid slots. May need equipment value adjustments for HEAD/LEGS to make Repeat worthwhile.

## Impact

- **Modify**: `src/game/combat.ts` — add exhaust-on-play for system cards, add slot restriction validation in modifier assignment
- **Modify**: `src/data/cards.ts` — add `allowedSlots` field to slot modifier cards, or derive from category. May adjust some system card effects to be worthy of one-time use.
- **Modify**: `src/game/types.ts` — add slot restriction type to card definitions
- **Modify**: `src/store/runStore.ts` — enforce slot restrictions in `playCard`
- **Modify**: `src/components/CombatScreen.tsx` / `Hand.tsx` — UI: gray out or filter invalid slot targets when assigning a modifier
- **Modify**: `src/data/parts.ts` — potentially buff HEAD/LEGS equipment base values
- **Modify**: `src/components/BodySlotPanel.tsx` — show valid assignment targets
