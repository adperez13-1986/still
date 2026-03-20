## 1. Type System Changes

- [x] 1.1 Add `{ type: 'feedback' }` variant to SlotModifierEffect union in types.ts
- [x] 1.2 Add `feedbackArmsBonus: number` to CombatState in types.ts
- [x] 1.3 Add `persistentBlock: number` to CombatState in types.ts

## 2. Feedback Card Definition

- [x] 2.1 Add Feedback card definition (base: 2E, upgraded: 1E, slot modifier, subtype feedback, universal placement) in cards.ts
- [x] 2.2 Add Feedback to S1 card pool

## 3. Feedback Resolution Logic

- [x] 3.1 Add feedback case to resolveBodyAction in combat.ts — check slot and apply appropriate secondary effect
- [x] 3.2 Implement HEAD feedback: set feedbackArmsBonus = cardsDrawn × 2 during HEAD resolution
- [x] 3.3 Implement TORSO feedback: deal floor(blockGained × 0.75) damage to random enemy during TORSO resolution
- [x] 3.4 Implement ARMS feedback: heal player floor(damageDealt × 0.33) during ARMS resolution
- [x] 3.5 Implement LEGS feedback: flag block as persistent (don't reset at turn end)
- [x] 3.6 Apply feedbackArmsBonus as additional damage during ARMS resolution, then reset to 0
- [x] 3.7 Reset feedbackArmsBonus to 0 at start of each execution phase

## 4. Persistent Block Logic

- [x] 4.1 At turn start, apply 25% decay to persistentBlock: `persistentBlock = floor(persistentBlock * 0.75)`
- [x] 4.2 Add persistentBlock to player's block at turn start (after decay)
- [x] 4.3 At turn end, if Feedback was on LEGS this turn, add LEGS block to persistentBlock instead of resetting it

## 5. Stat Decay

- [x] 5.1 In endTurn (combat.ts), after enemy resolution: decrement player Strength by 1 (min 0)
- [x] 5.2 In endTurn (combat.ts), after enemy resolution: decrement player Dexterity by 1 (min 0)
- [x] 5.3 Verify enemy Strength from Buff intents is NOT decayed

## 6. Slot Restriction Update

- [x] 6.1 Update getAllowedSlots in combat.ts to allow Feedback on any slot with equipment (same as Repeat: return null for universal)

## 7. UI Updates

- [x] 7.1 Add Feedback intent description in EnemyPanel.tsx test component
- [x] 7.2 Add Feedback modifier icon and color in EnemyCard.tsx (if needed for display)
- [x] 7.3 Update BodySlotPanel to show Feedback effect description based on target slot

## 8. Verification

- [x] 8.1 Type-check passes (npx tsc --noEmit)
- [x] 8.2 Verify Feedback on each slot works correctly via test panel or playtest
