## 1. Effective Damage Display

- [x] 1.1 Add `combatsCleared` prop to EnemyCard
- [x] 1.2 Add `getEffectiveDamage` helper that applies scaling, Strength, Weak to base intent value
- [x] 1.3 Update IntentDisplay (full view) to show effective damage for Attack/AttackDebuff
- [x] 1.4 Update compact intent display to show effective damage
- [x] 1.5 Pass `combatsCleared` from CombatScreen to EnemyCard (both mobile and desktop renders)

## 2. Pile Viewer

- [x] 2.1 Make pile counters visible on mobile (remove `!isMobile` guard)
- [x] 2.2 Make each counter (Draw/Discard/Exhaust) clickable
- [x] 2.3 Add pile viewer overlay — shows cards sorted alphabetically with category color and heat cost
- [x] 2.4 Tap backdrop or × to close

## 3. Shop Info Button

- [x] 3.1 Add `parts` and `equipment` props to ShopScreen
- [x] 3.2 Add INFO button in shop header
- [x] 3.3 Open RunInfoOverlay when tapped
- [x] 3.4 Pass parts/equipment from RunScreen to ShopScreen

## 4. Carry-Nothing Bug Fix

- [x] 4.1 Fix `onDismiss` in WorkshopScreen to call `clearCarriedPart()` + `save()` instead of just closing the overlay
