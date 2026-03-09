## Why

Behavioral parts are invisible during combat. Players can't see which parts they have, don't know when they trigger, and can't learn what they do through gameplay. This makes parts feel like hidden bonuses rather than build-defining choices.

## What Changes

- Display owned behavioral parts as compact letter-badge icons on the mobile combat screen (below execute bar)
- Add a `partTrigger` event to `CombatEvent` so part activations flow through the animation replay system
- Animate part badges with a glow/pulse when they trigger during execution
- Tap a badge to see the part's name and description in a popup

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- `src/game/types.ts` — add `partTrigger` variant to `CombatEvent`
- `src/game/combat.ts` — emit `partTrigger` events from `applyPartEffect` and inline part hooks
- `src/components/CombatScreen.tsx` — render part badges, handle `partTrigger` in animation replay
