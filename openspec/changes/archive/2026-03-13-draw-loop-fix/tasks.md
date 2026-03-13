## 1. Remove Mid-Turn Reshuffle

- [x] 1.1 In `drawCards()` in `combat.ts`, remove the block that shuffles `discardPile` into `drawPile` when `drawPile` is empty — draws should fizzle instead
- [x] 1.2 Ensure turn-start draw (in `startTurn` or `initCombat`) proactively shuffles `discardPile` into `drawPile` before drawing the opening hand if `drawPile` has fewer cards than the draw count

## 2. Perpetual Core Part

- [x] 2.1 Add `onDrawPileEmpty` trigger type to the `PartTrigger` union in `types.ts`
- [x] 2.2 Add Perpetual Core part definition in `parts.ts` — rare, `onDrawPileEmpty` trigger, effect reshuffles discard into draw pile
- [x] 2.3 In `drawCards()` in `combat.ts`, when draw pile is empty and discard is not empty, check if player has Perpetual Core — if so, shuffle discard into draw pile and continue drawing

## 3. Verification

- [ ] 3.1 Playtest: verify draw fizzles in thin deck without Perpetual Core (no infinite loop)
- [ ] 3.2 Playtest: verify draw works normally in fat deck (early game unaffected)
- [ ] 3.3 Playtest: verify Perpetual Core enables infinite loop in thin deck with draw + cooling cards
