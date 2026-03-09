## 1. Event plumbing

- [x] 1.1 Add `partTrigger` variant to `CombatEvent` in types.ts: `{ type: 'partTrigger'; partId: string }`
- [x] 1.2 Emit `partTrigger` events from `applyPartEffect` in combat.ts (push to `result.combat.combatLog`)
- [x] 1.3 Emit `partTrigger` events from inline part hooks (Thermal Oscillator AOE, Momentum Core draw, Pressure Valve, Ablative Shell)

## 2. Badge rendering

- [x] 2.1 Create `PartBadges` component: renders `run.parts` as a horizontal row of 2-letter abbreviation circles with rarity-colored borders
- [x] 2.2 Add `PartBadges` to mobile CombatScreen layout below the sticky execute bar
- [x] 2.3 Add tap-to-info popup on badge tap showing part name, description, and rarity

## 3. Trigger animation

- [x] 3.1 Add `activePartIds` state to CombatScreen for tracking which parts are glowing
- [x] 3.2 Handle `partTrigger` events in animation replay: set badge to active for ~600ms with glow color based on effect type
- [x] 3.3 Style active badge with CSS box-shadow glow animation (blue=block, green=heat reduction, red=damage, white=other)
