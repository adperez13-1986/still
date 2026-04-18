## 1. Player Card Component

- [x] 1.1 Create PlayerCard component: HP bar (filled proportional), current/max HP number, block badge (shield icon + number, hidden when 0)
- [x] 1.2 Position player card centered between enemy row and action slots
- [x] 1.3 Player card has a ref for positioning floating numbers on it

## 2. Enemy Card Refactor

- [x] 2.1 Wrap each enemy card in a ref-tracked container for per-enemy float positioning
- [x] 2.2 Damage floats render inside each enemy's container (positioned absolute, relative to that enemy)
- [x] 2.3 AoE damage shows a float on each enemy simultaneously

## 3. Floating Number System

- [x] 3.1 Build float entries from combat log, tagged with target: 'player' or enemyId
- [x] 3.2 Player-targeted floats render inside the player card container
- [x] 3.3 Enemy-targeted floats render inside the matching enemy card container
- [x] 3.4 Sequential playback: 500ms delay between events via CSS animation-delay
- [x] 3.5 Animation: fade in, float up ~28px, fade out over 1s
- [x] 3.6 Colors: red (damage), green (heal), blue (block), gold (synergy), orange (strain)

## 4. Compact Action Slots

- [x] 4.1 Redesign ActionSlot: type icon + name on first line, value large and centered, ~40px height
- [x] 4.2 Pair layout: two slots per row with synergy indicator between them
- [x] 4.3 Solo slot centered below pairs
- [x] 4.4 Push state shown by orange border, unpushed is subtle border

## 5. Layout Assembly

- [x] 5.1 Restructure StrainCombatScreen planning UI: strain meter → enemy row → player card → action slots → vent/execute
- [x] 5.2 Remove CombatLog component and its rendering
- [x] 5.3 Verify layout fits on 375×667 without scrolling
- [x] 5.4 Reward/forfeit/death screens unchanged

## 6. Playtest

- [x] 6.1 Verify damage numbers appear on the correct entity
- [x] 6.2 Verify pacing feels readable (tuned to 1000ms during playtest)
- [x] 6.3 Verify action slots are clear enough to make push decisions
- [x] 6.4 Verify layout fits on phone without scrolling
