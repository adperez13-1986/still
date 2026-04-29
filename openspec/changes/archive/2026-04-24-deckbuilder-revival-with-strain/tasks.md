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

- [x] 6.1 Remove `startStrainCombat`, `toggleSlotPush`, `toggleVent`, `selectStrainTarget`, `executeStrainTurn`, `applyGrowthAction`, `swapSlots` methods from runStore (keep `applyComfortReward`)
- [x] 6.2 `startCombat(enemies)` now passes `state.strain` as the `startingStrain` arg to `initCombat`
- [x] 6.3 `playCard(instanceId, targetSlot?, targetEnemyId?, pushed?)` accepts `pushed` and flows it into `playModifierCard`; also forces forfeit if a push spikes strain past the cap
- [x] 6.4 Added `finishCombat()` action: reads `combat.strain`, applies `STRAIN_DECAY_BETWEEN_COMBATS`, writes to `RunState.strain`, clears combat. Forfeit detection added in `executeTurn` after each phase.
- [x] 6.5 Added `applyGrowthStrainCost(tier)` action: common=2, uncommon=3, rare=4; writes into CombatState.strain during the reward phase so post-reward `finishCombat` captures it.

## 7. Route Runs to Deckbuilder UI

- [x] 7.1 Removed the `if (run.strainCombat) return <StrainCombatScreen />` branch in `RunScreen.tsx`
- [x] 7.2 `if (run.combat) return <CombatScreen />` path is now the only combat route
- [x] 7.3 Removed `SlotRearrangement` import, `showSlots` state, and the Slots button
- [x] 7.4 Both `startRun({...})` calls (debug preset + normal start) drop `slotLayout`/`acquiredActions`/`strainCombat`/`growth` and retain `strain: 2`
- [x] 7.5 Persistence already round-trips deck/equipment/parts — verified
- [x] 7.6 `restoreRun` discards saves that have `slotLayout` but no `deck` (old unified-slot save)

## 8. UI Polish — Port from StrainCombatScreen

**Note:** `StrainCombatScreen.tsx` and `SlotRearrangement.tsx` were removed in section 10 (early deletion); code was captured and ported from the session's reading.

- [x] 8.1 Added `StrainMeter` component inline in `CombatScreen.tsx` at the top of the combat view
- [x] 8.2 Extended `StillPanel` with optional `strain`/`maxStrain` props (both compact and full layouts show S x/y); CombatScreen passes them through
- [x] 8.3 Per-entity floats: already present in `CombatScreen.tsx` via `damageNumbers` keyed by enemy instanceId or 'still' — wired through the existing `applyEvent` path (no port needed)
- [x] 8.4 Step-through replay: already in `CombatScreen.tsx` (`activeSlot`, `displayHealth`, `displayBlock`, `displayEnemyHealth`, `playNext` sequencer) — no port needed
- [x] 8.5 Compact battle log: existing `combatLog` replay via floats/flashes serves this role (the old prototype also leaned on floats — no dedicated panel); revisit after playtest if explicit log is still wanted
- [x] 8.6 Mobile viewport: existing `isMobile` branch already keeps `StillPanel` compact and stacks enemies — StrainMeter is 10px tall so the overhead is minimal. Explicit 375×667 playtest noted in section 13.

## 9. Reward Flow

- [x] 9.1 Existing victory → `phase: 'reward'` → `RewardScreen` path already fires; CombatScreen now passes strain/comfort props.
- [x] 9.2 Each part/equip drop label shows `+Ns` (common/uncommon/rare → 2/3/4); card offers show a shared "+2 strain" header. Projected strain is shown at the top of the reward screen (current → after accepts → with card).
- [x] 9.3 Drops that would push strain ≥ maxStrain render in a dimmed color with `onToggle` stripped; card picks disable pointer events; "Continue" is disabled when no-card path would overcap.
- [x] 9.4 Added comfort option below growth drops. Comfort ids: `heal` (HP < 50%), `relief` (strain ≥ 10), `companion` (default). Modifies CombatState.strain / health directly so post-reward `finishCombat` carries the change across the decay step.

## 10. Delete Unified-Slot System

**Done early (before sections 8/9) — UI code captured in memory for copy-paste reference during polish.**

- [x] 10.1 Deleted `src/game/strainCombat.ts`
- [x] 10.2 Deleted `src/components/StrainCombatScreen.tsx`
- [x] 10.3 Deleted `src/components/SlotRearrangement.tsx`
- [x] 10.4 Deleted `src/data/actions.ts`
- [x] 10.5 Removed `ActionType`, `ActionDefinition`, `SlotLayout`, `SynergyEffect`, `SynergyId` from `src/game/types.ts`
- [x] 10.6 Removed `slotLayout`, `acquiredActions`, `strainCombat`, `growth` from `RunState`

## 11. Sim Deletion

- [x] 11.1 Deleted `src/sim/strainCli.ts`
- [x] 11.2 Deleted `src/sim/strainHeuristic.ts`, `src/sim/strainRunSim.ts`, `src/sim/strainRunner.ts`, `src/sim/strainProfiles.ts`
- [x] 11.3 Generic sim files (`cli.ts`, `heuristic.ts`, `runner.ts`, `stats.ts`, `rng.ts`) retained

## 12. Type Check + Build

- [x] 12.1 `npx tsc -p tsconfig.app.json --noEmit` passes
- [x] 12.2 `npx vite build` succeeds (496 KB bundle, 93 modules)
- [x] 12.3 No unused exports remaining (strict `noUnusedLocals` / `noUnusedParameters` pass)

## 13. Playtest — DEFERRED to a follow-up balance change

These criteria are validation gates, not implementation work, and are being punted to a dedicated balance change once we have UI + playtest signal. Track in the next change:

- [ ] 13.1 Full S1 playthrough end-to-end: combat works, strain accumulates, forfeit triggers, vent works, pushable cards work
- [ ] 13.2 HEAD/LEGS slot viability (VULN cap holds, fight doesn't trivialize)
- [ ] 13.3 ≥2 distinct viable archetypes (Counter / aggressive push / block-defensive) — document in playtest notes
- [ ] 13.4 Push decisions feel meaningful (not "always push", not "never push")
- [ ] 13.5 Strain-theme emotional beats land (forfeit as real choice, vent as sacrifice, push as commitment)

**Also rolled into that follow-up change:**
- 7 deferred pushable cards (3.6 Feedback, 3.7 Thermal Surge†, 3.8 Spread Shot, 3.9 Emergency Shield†, 3.10 Deep Freeze†, 3.11 Retaliate, 3.12 Echo Protocol†) — entries marked `†` were partially shipped in this change at the data layer (push variants added directly in `src/data/cards.ts` after the playtest gap; their full design-doc behavior may still need engine work)
- 5.3 Repeat-no-double-debuff (mitigated by the 3-stack cap from 5.2; revisit only if playtest shows it matters)
- Any balance tuning that surfaces from the playtest itself (push cost calibration, decay rate, growth strain costs, forfeit threshold)

## 14. Memory Updates

- [x] 14.1 Updated MEMORY.md: replaced the "🚧 IN PROGRESS" block with the current state, replaced the "Unified Action Slots (IN PROGRESS)" section with "Deckbuilder revival + strain (Era 5)" that points to the archived `2026-04-11-unified-action-slots` and explains why it was superseded.
- [x] 14.2 Added Era 5 section to `system-iterations.md` with the what/why, watch-items for playtest (push decision density, forfeit frequency, archetype diversity, reward strain gating, mobile viewport), and infrastructure deletion summary.
