## 1. Combat Log Infrastructure

- [x] 1.1 Add `CombatEvent` type to types.ts (slotFire, enemyAction, hotPenalty, overheatShutdown, statusTick)
- [x] 1.2 Add `combatLog: CombatEvent[]` field to `CombatState`
- [x] 1.3 Emit log events in `executeBodyActions` — one `slotFire` event per slot that actually fires (skip empty/unequipped)
- [x] 1.4 Emit log events in `executeEnemyTurn` — one `enemyAction` event per surviving enemy
- [x] 1.5 Emit log events in `endTurn` — `hotPenalty` if applicable, `overheatShutdown` if applicable

## 2. Execution Replay in CombatScreen

- [x] 2.1 Add `animating` state and `currentEventIndex` to CombatScreen — when combat log is non-empty after executeTurn, enter animating mode
- [x] 2.2 Step through log events with timers (400ms per slot fire, 350ms per enemy action, 300ms per end-of-turn effect)
- [x] 2.3 Highlight the active body slot during slotFire events (pass `activeSlot` prop to BodySlotPanel)
- [x] 2.4 Disable all input (card interactions, Execute button) while animating
- [x] 2.5 On animation complete, clear the log and re-enable input for the next planning phase

## 3. Floating Damage Numbers

- [x] 3.1 Create `DamageNumber` component — absolutely positioned, animates upward + fade out over 600ms using CSS keyframes
- [x] 3.2 Show red damage numbers on enemies when slotFire events deal damage
- [x] 3.3 Show blue block numbers near Still when slotFire grants block
- [x] 3.4 Show red damage numbers near Still when enemyAction events deal damage

## 4. Screen Flash and Visual Feedback

- [x] 4.1 Add red screen flash overlay (200ms) triggered by enemyAction damage events during replay
- [x] 4.2 Add CSS transitions to StillPanel health bar (transition: width 0.3s ease)
- [x] 4.3 Add CSS transitions to EnemyCard health bar
- [x] 4.4 Add CSS transitions to HeatTrack gauge
