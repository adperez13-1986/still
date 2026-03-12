## 1. Remove Per-Slot Heat Generation

- [x] 1.1 In `resolveBodyAction` (combat.ts:216), change `heatGenerated: 1` to `heatGenerated: 0`
- [x] 1.2 Remove the `result.heatGenerated += 1` for extra firings from part triggers (combat.ts:383)
- [x] 1.3 Remove `extraHeatGenerated` handling from `resolveBodyAction` (combat.ts:272-274) — this moves to assignment time

## 2. Move Extra-Heat Equipment to Assignment Time

- [x] 2.1 In card-assignment logic (combat.ts ~line 790), when assigning a modifier to a slot, check if slot's equipment has `extraHeatGenerated` and apply heat via `applyHeatChange`
- [x] 2.2 In card-unassignment logic, refund the `extraHeatGenerated` heat — apply inverse heat change but do NOT fire threshold-crossing triggers on refund
- [x] 2.3 Update BodySlotPanel UI to show extra heat cost in assignment preview (e.g., "+1 extra heat" indicator on Overclocked Pistons slot)

## 3. Remove Passive Cooling Parts

- [x] 3.1 Remove `feedbackLoop` and `residualCharge` definitions from parts.ts
- [x] 3.2 Remove both from `SECTOR_1_PARTS` array
- [x] 3.3 Check if `onModifierAssign` trigger type is used by any other parts — if not, remove the trigger handling block in combat.ts (~line 790-795)

## 4. Simplify Heat Projection

- [x] 4.1 Simplify `projectHeat` (combat.ts:1266) — return `currentHeat` directly instead of simulating per-slot accumulation
- [x] 4.2 Simplify `projectSlotActions` (combat.ts:1329) — remove `simulatedHeat` tracking, pass `combat.heat` to all `resolveBodyAction` calls uniformly
- [x] 4.3 Remove or simplify `heatAtExecution` field in `SlotProjection` — all slots share the same heat value

## 5. UI Updates

- [x] 5.1 Update heat projection display in CombatScreen — current heat IS execution heat, no per-slot drift to show
- [x] 5.2 Verify slot projection panels show correct inactive/multiFire status using planning-end heat — also fixed heatConditionOnly check in executeBodyActions that broke when heatGenerated became 0

## 6. Verification

- [ ] 6.1 Playtest Cool Runner: play 3 cards, stay at heat 3, verify ALL slots get Cool bonuses
- [ ] 6.2 Playtest Pyromaniac: play 7+ cards, reach heat 7+, verify ALL slots get Hot bonuses
- [ ] 6.3 Playtest extra-heat equipment: assign modifier to Overclocked Pistons slot, verify +1 heat applies immediately during planning
- [ ] 6.4 Playtest extra-heat removal: unassign modifier from extra-heat slot, verify heat refunds without triggering oscillator
- [ ] 6.5 Playtest LEGS cooling: verify it still fires during execution and reduces heat for next turn
- [ ] 6.6 Verify Residual Charge and Feedback Loop no longer appear in part rewards
