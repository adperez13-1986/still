## Context

Combat currently resolves in a single frame — `executeTurn` in runStore processes body actions, enemy turns, end-of-turn effects, and next-turn setup all within one `set()` call. The CombatScreen reads final state and renders it instantly. There's no visual gap between "I clicked Execute" and "everything is done."

The execution phase fires HEAD, TORSO, ARMS, LEGS in order. Enemies then act. These are the natural "beats" we want to make visible.

## Goals / Non-Goals

**Goals:**
- Step-by-step execution: each body slot fires visibly with a pause between
- Enemy actions shown one at a time
- Floating damage/block numbers that pop in and fade out
- Screen flash when Still takes damage
- Smooth CSS transitions on health bars, block, heat gauge
- Input blocked during animation sequence
- Works on mobile (no heavy animation libs)

**Non-Goals:**
- Sprite animations or character poses (future work)
- Card play animations (cards flying to slots)
- Sound effects
- Changing combat mechanics or timing

## Decisions

### Combat log approach (not step-by-step state mutation)

Rather than breaking `executeTurn` into multiple store mutations with timeouts between them (which would be complex and fragile), we keep it synchronous and add a **combat log** — a list of events that happened during resolution.

The CombatScreen replays the log visually:
1. User clicks Execute
2. `executeTurn` resolves fully and produces a `combatLog: CombatEvent[]`
3. CombatScreen enters "animating" mode, replaying events with delays
4. During replay, the UI shows intermediate visual states (highlighting active slot, showing damage numbers)
5. When replay completes, the final state is revealed and input re-enables

**Why log-based?** Keeps the game logic clean and synchronous. The animation layer is purely visual and can be tuned independently. If animation bugs out, the state is still correct.

### CombatEvent types

```
type CombatEvent =
  | { type: 'slotFire'; slot: BodySlot; damage?: number; block?: number; heal?: number; targetMode: string }
  | { type: 'enemyAction'; enemyId: string; intent: IntentType; damage?: number; block?: number; statusApplied?: string }
  | { type: 'hotPenalty'; damage: number }
  | { type: 'overheatShutdown' }
  | { type: 'statusTick'; effects: string[] }
```

### Animation timing

- Each body slot fire: 400ms pause
- Each enemy action: 350ms pause
- End-of-turn effects: 300ms pause
- Total execution sequence: ~2-3 seconds for a typical turn (4 slots + 1-2 enemies + end effects)

This is a significant cadence change. Currently a turn takes <100ms. The ~2-3s adds rhythm without feeling slow.

### DamageNumber component

A small absolutely-positioned element that appears near the target, shows a number (red for damage, blue for block, green for heal), animates upward and fades out over 600ms using CSS keyframes. No JS animation library needed.

### Highlighting active slot during execution

During the replay, the BodySlotPanel highlights the currently-firing slot (bright border pulse) and dims the others. This draws the eye to where the action is happening.

### Screen flash on damage taken

When an `enemyAction` with damage plays, a brief red overlay flashes across the screen (opacity 0 → 0.15 → 0 over 200ms). Simple CSS animation triggered by a state flag.

### CSS transitions on value changes

Health bars, block displays, and the heat gauge get `transition: width 0.3s ease` (for bars) or `transition: color 0.3s` for numbers. This makes value changes feel smooth instead of jumpy. Applied to StillPanel, EnemyCard, and HeatTrack.

## Risks / Trade-offs

- **[Pacing feels slow]** 2-3 seconds per turn might feel tedious after many combats. Mitigation: can add a "fast mode" toggle later, or reduce delays. Start with these timings and tune based on feel.
- **[Log desync]** If the log doesn't match the final state, visuals could be confusing. Mitigation: log is generated during actual resolution — it's a record of what happened, not a prediction.
- **[Mobile performance]** CSS transitions and keyframe animations are GPU-accelerated. No Canvas or heavy rendering. Should be fine on mobile.
