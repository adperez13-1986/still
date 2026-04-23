## 1. Strain on CombatState

- [x] 1.1 Add `strain: number` and `maxStrain: number` to `CombatState` interface in `src/game/types.ts`
- [x] 1.2 Inline `STRAIN_DECAY_BETWEEN_COMBATS` (4) and `VENT_STRAIN_RECOVERY` (5) as constants in `src/game/combat.ts`
- [x] 1.3 Update `initCombat()` in `src/game/combat.ts` to accept initial strain value and set `strain`/`maxStrain` on the returned state
- [x] 1.4 Forfeit helpers `hasForfeited()` and `applyForfeit()` added; runStore will wire up the check in Section 6

## 2. Pushable Card Model

- [x] 2.1 Add `pushCost?: number` and `pushedCategory?: ModifierCardType` to `ModifierCardDefinition` (using category swap instead of effect-only swap — cleaner and covers both slot and system cards)
- [x] 2.2 Add push state tracking: `pushedCards: Record<instanceId, boolean>` on CombatState
- [x] 2.3 Update `playModifierCard()` to accept `pushed` flag, swap category to pushedCategory when pushed, check strain budget, charge strain on top of energy
- [x] 2.4 Update `unassignModifier()` to refund strain if the card was pushed and clear push state

## 3. Initial Pushable Card Content

- [x] 3.1 Overcharge: Amplify ×2.5 (from ×2.0), 1 strain
- [x] 3.2 Meltdown: 22 damage (from 15), 2 strain
- [x] 3.3 Reckless Charge: 26 damage (from 18), 2 strain
- [x] 3.4 Fortify: 10/10 (from 6/6), 1 strain
- [x] 3.5 Shield Bash: 16 damage (from 10), 1 strain
- [ ] 3.6 Feedback — deferred to post-playtest content pass
- [ ] 3.7 Thermal Surge — deferred
- [ ] 3.8 Spread Shot — deferred
- [ ] 3.9 Emergency Shield — deferred
- [ ] 3.10 Deep Freeze — deferred
- [ ] 3.11 Retaliate — deferred
- [ ] 3.12 Echo Protocol — deferred

## 4. Vent Card

- [x] 4.1 Repurpose existing vent card in `src/data/cards.ts`: ventEffect: true, ventStrainRecovery: 5, freePlay, Innate, 0 energy
- [x] 4.2 Vent card handler in playModifierCard sets ventedThisTurn flag; executeBodyActions zeros out damage from slots when venting; ventedThisTurn resets in startTurn
- [x] 4.3 Vent is already in STARTING_CARDS (2 copies)

## 5. HEAD VULN Fix

- [x] 5.1 Added `headDebuffsApplied: Record<enemyId, Record<StatusType, number>>` to CombatState
- [x] 5.2 HEAD debuff application caps each debuff type at 3 stacks per enemy per combat
- [ ] 5.3 Repeat-no-double-debuff — mitigated by the 3-stack cap (Repeat firing 2x with 1 stack only adds up to 2, still within cap). Can revisit if playtest shows it matters.

## 6. Wire RunStore to Deckbuilder

- [ ] 6.1 Remove `startStrainCombat`, `toggleSlotPush`, `toggleVent`, `selectStrainTarget`, `executeStrainTurn`, `applyGrowthAction`, `swapSlots` methods from runStore (keep `applyComfortReward`)
- [ ] 6.2 Ensure `startCombat(enemies)` properly initializes combat with current `strain` value from RunState
- [ ] 6.3 Extend `playCard(instanceId, targetSlot?, targetEnemyId?, pushed?)` to accept a `pushed` flag that flows through to `playModifierCard`
- [ ] 6.4 After each combat, decay strain by `STRAIN_DECAY_BETWEEN_COMBATS` when writing CombatState.strain back to RunState.strain
- [ ] 6.5 Update reward application to work with tier-based card/part/equipment rewards (accepts reward type + tier, applies strain cost)

## 7. Route Runs to Deckbuilder UI

- [ ] 7.1 In `src/components/RunScreen.tsx`, remove the `if (run.strainCombat) return <StrainCombatScreen />` branch
- [ ] 7.2 Verify `if (run.combat) return <CombatScreen />` path is active and uses the right data
- [ ] 7.3 Remove `SlotRearrangement` usage and the Slots button in the floating buttons area
- [ ] 7.4 Update the `run.startRun({...})` calls in RunScreen to include starting deck, equipment, and parts (remove `slotLayout`, `acquiredActions`)
- [ ] 7.5 Ensure `persistence.ts` save/restore includes the deckbuilder fields (should already — they predate the pivot)
- [ ] 7.6 Add a save-schema check: if a restored run has `slotLayout` but no `deck`, it's an old save — clear it and start fresh

## 8. UI Polish — Port from StrainCombatScreen

**Note:** `StrainCombatScreen.tsx` and `SlotRearrangement.tsx` still exist in the codebase at this point — use them as copy-paste reference.

- [ ] 8.1 Add strain meter at top of `CombatScreen.tsx` (copy StrainMeter component from StrainCombatScreen)
- [ ] 8.2 Add a player card / stats strip showing HP bar, block badge, strain alongside the existing energy display (adapt PlayerCard from StrainCombatScreen)
- [ ] 8.3 Port the per-entity floating number system (damage/block/heal floats on the specific entity affected)
- [ ] 8.4 Port the step-through execution replay: active slot highlight, per-entity flash, HP bar interpolation
- [ ] 8.5 Port the battle log panel (compact text log below the slots) — already in both; ensure it shows the unified event stream
- [ ] 8.6 Test on 375×667 phone viewport — may need to compact body slot panels

## 9. Reward Flow

- [ ] 9.1 Re-enable Era 2 reward screen flow: when combat ends in victory, show the existing `RewardScreen.tsx` with card/part/equipment drops
- [ ] 9.2 Add strain cost display by tier to each growth option (common: 2, uncommon: 3, rare: 4)
- [ ] 9.3 Grey out growth options that would push strain to 20
- [ ] 9.4 Add the comfort option alongside growth options (use the same pickComfortReward logic from StrainCombatScreen)

## 10. Delete Unified-Slot System

**Now safe to delete — all UI and engine work is done and referenced code has been ported.**

- [ ] 10.1 Delete `src/game/strainCombat.ts`
- [ ] 10.2 Delete `src/components/StrainCombatScreen.tsx`
- [ ] 10.3 Delete `src/components/SlotRearrangement.tsx`
- [ ] 10.4 Delete `src/data/actions.ts`
- [ ] 10.5 Remove `ActionType`, `ActionDefinition`, `SlotLayout`, `SynergyEffect`, `SynergyId` types from `src/game/types.ts`
- [ ] 10.6 Remove `slotLayout`, `acquiredActions`, `strainCombat`, `growth` fields from `RunState` (keep `strain` field on RunState to persist between combats)

## 11. Sim Deletion

- [ ] 11.1 Delete `src/sim/strainCli.ts`
- [ ] 11.2 Delete `src/sim/strainHeuristic.ts`, `src/sim/strainRunSim.ts`, `src/sim/strainRunner.ts`, `src/sim/strainProfiles.ts`
- [ ] 11.3 Leave the generic `src/sim/cli.ts`, `src/sim/heuristic.ts`, `src/sim/runner.ts`, `src/sim/stats.ts`, `src/sim/rng.ts` (for future rewrite)

## 12. Type Check + Build

- [ ] 12.1 `npx tsc -p tsconfig.app.json --noEmit` passes
- [ ] 12.2 `npx vite build` succeeds
- [ ] 12.3 No unused exports remaining

## 13. Playtest

- [ ] 13.1 Run a full S1 playthrough end-to-end: combat works, strain accumulates, forfeit triggers, vent works, pushable cards work
- [ ] 13.2 Verify HEAD/LEGS are viable slots (VULN stacking is capped, fight doesn't trivialize)
- [ ] 13.3 Identify at least 2 distinct viable archetypes (e.g., Counter build, aggressive push build, block/defensive build) — document in playtest notes
- [ ] 13.4 Confirm push decisions feel meaningful (not "always push" and not "never push")
- [ ] 13.5 Confirm strain-theme emotional beats land: forfeiting feels like a real choice, vent feels like a sacrifice, pushing a card feels like commitment

## 14. Memory Updates

- [ ] 14.1 Add an entry to MEMORY.md pointing to the archived `2026-04-11-unified-action-slots` with short summary of why it was superseded
- [ ] 14.2 Update `system-iterations.md` with Era 5 (deckbuilder revival + strain) — what worked, what to watch for
