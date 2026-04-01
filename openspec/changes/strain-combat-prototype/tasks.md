## 1. Prototype Combat Engine

- [x] 1.1 Create `src/game/strainCombat.ts` — self-contained prototype combat
- [x] 1.2 3 hardcoded slots: Strike (6/9 dmg), Shield (5/7 block), Barrage (4/6 dmg all). Push cost 1 each.
- [x] 1.3 Strain tracking: starts from run state, accumulates on push/ability, carries back on end
- [x] 1.4 Strain 20 forfeit: end combat, no rewards, strain drops to 14
- [x] 1.5 Enemy turn: reuse existing intent patterns (attack, block, buff)
- [x] 1.6 Enemy targeting: player selects which enemy receives single-target damage
- [x] 1.7 Passive strain decay of 2 between combats

## 2. Abilities

- [x] 2.1 Repair (1 strain): heal 4 HP
- [x] 2.2 Brace (1 strain): reduce incoming damage by 3 per hit this turn
- [x] 2.3 Vent (0 cost, recovers 4 strain): skip all attacks this turn

## 3. Run State

- [x] 3.1 Add `strain` and `strainCombat` fields to run state. Initialize strain to 2.
- [x] 3.2 Route combat rooms to strain combat instead of card combat
- [x] 3.3 Max strain 20 (was 10, expanded after playtesting)

## 4. Prototype UI

- [x] 4.1 Combat screen: 3 slot cards with push toggles, strain meter (0-20), enemy display with intents, execute button
- [x] 4.2 Strain cost preview on toggle (current → projected)
- [x] 4.3 Pushed vs baseline values on each slot
- [x] 4.4 Forfeit warning when selections would hit 20
- [x] 4.5 Forfeit screen ("You stopped." — no rewards)
- [x] 4.6 Reward screen ("Still standing.")
- [x] 4.7 Ability buttons with strain cost display
- [x] 4.8 Enemy targeting (tap to select, red border)
- [x] 4.9 Combat log showing slot fire, enemy actions, abilities, damage reduction
- [x] 4.10 Vent disables push toggles visually

## 5. Playtest & Iterate

- [x] 5.1 Core loop playable: push, abilities, vent all functional
- [ ] 5.2 Explore rewards system
