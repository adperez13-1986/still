## Why

Energy is a budget that resets every turn — no tension, no story. The strain meter replaces it with a system that accumulates permanently during combat, creating the core tension: every action is a commitment, playing safe is slowly losing, and pushing too hard means giving up. This prototype strips combat to its absolute simplest form: 3 slots with placeholder identities, baseline actions, and the choice to push each slot harder at a strain cost. No cards, no deck, no equipment, no named slot identities.

## What Changes

- **BREAKING**: Remove the card system, energy system, and equipment system from combat for this prototype
- Combat is now: 3 slots fire in order. Each does a baseline action for free (0 strain).
  - **Slot A**: Deal 6 damage to one enemy
  - **Slot B**: Gain 5 block
  - **Slot C**: Deal 4 damage to all enemies
- The player's only decision each turn: **which slots to push.** Pushing a slot costs 1 strain and amplifies its action (×1.5, floored).
  - Slot A pushed: 9 damage
  - Slot B pushed: 7 block
  - Slot C pushed: 6 damage to all
- **Strain** is a 0-10 meter. It accumulates during combat and does NOT reset between turns.
- **Strain 10 = give up fight.** Combat ends immediately. No rewards. Run continues. HP unchanged. Strain drops to 7.
- Strain **carries between encounters** in a run. Never resets to 0.
- Strain **starts at 2** at the beginning of each run.
- Enemy system and intent system remain unchanged.
- This is a **prototype** — minimal viable implementation to test the feel. Not production-ready.

## Capabilities

### New Capabilities
- `strain-system`: The strain meter — accumulation, strain 10 forfeit, carry between encounters, starting strain
- `push-combat`: The simplified combat model — no cards, 3 generic slots with push toggle

### Modified Capabilities
- `combat-system`: Remove energy, remove card plays, remove equipment from combat. Add strain and push mechanic. Phases: push selection → execution → enemy turn.
- `game-core`: Run starts at strain 2. Strain carries between encounters. Strain 10 forfeits combat.

## Impact

- `src/game/combat.ts` — replace combat loop with strain + push prototype
- `src/game/types.ts` — simplified CombatState with strain + push state
- `src/ui/` combat UI — replace entire combat UI with minimal push selection interface
- `src/store/runStore.ts` — strain persists on run state
- Existing card/equipment/parts code untouched (bypassed, not deleted)
