## 1. Redesign Companion Card Definitions

- [x] 1.1 Redesign Yanah card: System (Cooling), 0 heat, base effect `gainBlock` 4, heatBonus at Cool with `gainBlock` 8. Update upgraded version similarly.
- [x] 1.2 Redesign Yuri card: System (Conditional), 1 heat, base effect `damage` 8 single_enemy, heatBonus at Hot with `damage` 14. Update upgraded version similarly.

## 2. Event System — Companion Outcome Type

- [x] 2.1 Add `'companion'` to `EventChoice.outcome.type` union in `narrative.ts`
- [x] 2.2 Handle `companion` outcome in `runStore.ts` event resolution — create card instance and add to run deck
- [x] 2.3 Track which companions have been acquired this run (add `companionsAcquired: string[]` to RunState or similar)

## 3. Companion Event Definitions

- [x] 3.1 Write Yanah event vignette in `narrative.ts` — garden scene, "I knew you'd come", accept/decline choices
- [x] 3.2 Write Yuri event vignette in `narrative.ts` — fighting scene, "Took you long enough", accept/decline choices
- [x] 3.3 Create companion event pool (separate from sector events), exported from `narrative.ts`

## 4. Companion Event Triggering

- [x] 4.1 Update `EventScreen.tsx` — when entering event room, check for available companion events (unlocked + not acquired this run), 30% chance to trigger instead of regular event
- [x] 4.2 Pass `companionsUnlocked` and `companionsAcquired` into event selection logic

## 5. Remove Auto-Deck Inclusion

- [x] 5.1 Remove companion auto-add from `RunScreen.tsx` run initialization (lines that check `companionsUnlocked` and push to `starterDeck`)
- [x] 5.2 Update Workshop companion descriptions to say "Unlocks event" instead of implying deck inclusion

## 6. Verification

- [x]6.1 Playtest: verify companion events appear only when unlocked and not yet acquired
- [x]6.2 Playtest: verify accepting adds card to deck and prevents re-encounter
- [x]6.3 Playtest: verify declining gives health and companion event can still appear later
- [x]6.4 Playtest: verify Yanah block bonus activates only while Cool, Yuri damage bonus only while Hot
