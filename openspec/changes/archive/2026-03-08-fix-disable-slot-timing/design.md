## Approach

Move the single line `result.combat.disabledSlots = []` from `startTurn` to the top of `executeEnemyTurn`. This way disables persist through the next planning + execution cycle and get cleared right before enemies potentially reapply them.

## Turn flow after fix

1. executeBodyActions — slots fire (disabledSlots from last enemy turn are in effect)
2. executeEnemyTurn — clear disabledSlots, then enemies act (may disable new slots)
3. endTurn — hot penalty, discard
4. startTurn — passive cooling, draw (disabledSlots NOT cleared here)
5. planning — player sees disabled slots, plans around them
6. GOTO 1
