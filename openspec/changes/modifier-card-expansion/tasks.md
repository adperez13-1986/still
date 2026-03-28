## 1. Type System

- [x] 1.1 Add new `SlotModifierEffect` variants to `types.ts`
- [x] 1.2 Reused existing ModifierCategory entries (Amplify/Repeat/Override)
- [x] 1.3 Add combat state flags + cardsExhaustedThisTurn counter
- [x] 1.4 Add new `SystemEffect` variants: `applyBurnout`, `disableOwnSlot`

## 2. Card Definitions

- [x] 2.1 Define berserker cards: Reckless Boost, Burnout, Overclock Slot, Shutdown
- [x] 2.2 Define exhaust cards: Scrap Charge, Jettison, Residual Charge
- [x] 2.3 Define counter cards: Cross-Wire, Iron Curtain, Absorb, Volatile Armor
- [x] 2.4 Define stat card: Reinforce
- [x] 2.5 Define bridge cards: Linked Fire, Redirect Power, Feedback Loop
- [x] 2.6 Added to pools (berserker seeds S1, rest S2) and allCardList

## 3. Combat Resolution

- [x] 3.1 Handle `amplifyWithSelfDamage` — amplify + selfDamage in ActionResult
- [x] 3.2 Handle `overclockSlot` — fire 3x + disableSlotNextTurn flag
- [x] 3.3 Handle Burnout — burnoutActive flag + startTurn -3HP/+2Str
- [x] 3.4 Handle Shutdown — disableOwnSlot effect in freePlay handler
- [x] 3.5 Handle `amplifyScaling` — multiplier from exhaust pile length
- [x] 3.6 Handle `overrideExhaustHand` — Jettison exhaust + damage in executeBodyActions
- [x] 3.7 Handle `repeatScaling` — extra firings from exhaust pile
- [x] 3.8 Handle `crossSlotBonus` — resolved in executeBodyActions with equipment context
- [x] 3.9 Handle `combinedBlockRetaliate` — amplify block + retaliate flag
- [x] 3.10 Handle `blockHeal` — absorbActive + heal after all slots fire
- [x] 3.11 Handle `volatileBlock` — damage to attacker during enemy attacks
- [x] 3.12 Handle `amplifyStatMultiplier` — extra stat bonus in resolveBodyAction
- [x] 3.13 Handle `redirectPower` — second firing with adjacent slot's action
- [x] 3.14 Handle `feedbackLoop` — extra firings = cardsExhaustedThisTurn
- [x] 3.15 Handle Linked Fire via crossSlotBonus with sourceSlot: 'Legs'

## 4. Verification

- [x] 4.1 TypeScript build passes (`tsc -b`)
- [x] 4.2 Sim runs without crashes, heuristic handles new cards (86.5% win rate with mixed deck)
