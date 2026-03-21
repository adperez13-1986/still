## 1. State Changes

- [x] 1.1 Add `persistentFeedback: Record<BodySlot, boolean>` to `CombatState` in `types.ts`, initialize all false in `initCombat`
- [x] 1.2 Change LEGS Feedback persistent block decay from 0.75 to 0.50 in `startTurn`

## 2. Card Definition

- [x] 2.1 Convert Feedback card from slot modifier to freePlay system card in `cards.ts`: cost 3E (upgraded: 2E), Exhaust keyword, system type with effects that apply persistent Feedback

## 3. Combat Logic

- [x] 3.1 Handle Feedback system card play in `playModifierCard`: detect Feedback system effect, set `persistentFeedback[targetSlot] = true`, no slot occupation
- [x] 3.2 Update `resolveBodyAction` to check `persistentFeedback[slot]` and apply Feedback secondary effects (HEAD/TORSO/ARMS/LEGS) even when no Feedback card is in the secondary slot
- [x] 3.3 Ensure Feedback on disabled slots is accepted (play succeeds) and activates when the slot later fires

## 4. UI

- [x] 4.1 Update body slot panel to show a persistent Feedback indicator when `persistentFeedback[slot]` is true
- [x] 4.2 Ensure Feedback card appears in hand as a system card with slot targeting UI (player picks any slot with equipment)

## 5. Sim Heuristic

- [x] 5.1 Update `src/sim/heuristic.ts` to recognize Feedback as an early-play system card (high priority on turn 1)
