## 1. Prototype Combat Engine

- [x] 1.1 Create `src/game/strainCombat.ts` — self-contained prototype combat: 3 hardcoded slots, strain state, push/execute/enemy turn loop
- [x] 1.2 Define slot actions inline: Slot A (6 dmg single), Slot B (5 block), Slot C (4 dmg all). Push multiplier 1.5x.
- [x] 1.3 Implement strain tracking: starts from run state, accumulates on push confirm, carries back to run state on combat end
- [x] 1.4 Implement strain 10 forfeit: end combat, no rewards, strain drops to 7
- [x] 1.5 Implement enemy turn: reuse existing enemy intent/action system (attack, block, buff patterns)

## 2. Run State

- [x] 2.1 Add `strain` field to run state (runStore). Initialize to 2 on new run.
- [x] 2.2 Add prototype combat start path that reads strain from run state and uses strainCombat instead of existing combat

## 3. Prototype UI

- [x] 3.1 Create minimal combat screen: 3 slot cards with push toggle buttons, strain meter (0-10), enemy display with intents, execute button
- [x] 3.2 Show strain cost preview on toggle (e.g., "5 → 6")
- [x] 3.3 Show pushed vs baseline values on each slot
- [x] 3.4 Strain 10 warning when selections would hit 10
- [x] 3.5 Forfeit screen ("You stopped." — no rewards, continue button)

## 4. Test

- [ ] 4.1 Playtest: fight one enemy across multiple turns, verify strain accumulates, push amplifies, forfeit triggers at 10
