# Stage Layout

## The two columns

```
┌──────────────────────────────────────────────────────────────────┐
│ Sector 1 · Round 3            [strain meter]              [Info] │ ← floating HUD
│                                                                  │
│                                                            ┌─────┤
│                                                            │ E3  │ ← depth 3 (smaller, faded)
│                                                ┌──────┐    └─────┤
│                                                │  E2  │          │ ← depth 2
│                                    ┌────────┐  └──────┘          │
│                                    │   E1   │                    │ ← depth 1
│                       ┌──────┐     └────────┘                    │
│         ┌─────────┐   │  E0  │                                   │ ← depth 0 (largest, frontmost)
│         │  STILL  │   └──────┘                                   │
│         └─────────┘                                              │
│                                                                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← floor fog gradient
└──────────────────────────────────────────────────────────────────┘
```

## Element ordering — important!

The enemy column uses `flex-direction: column-reverse` so:
- Array index 0 (combat.enemies[0]) = bottom of column = closest = depth 0
- Array index 3 (combat.enemies[3]) = top of column = furthest = depth 3

But the array order of `combat.enemies` is set at combat start; it doesn't reflect "who's in front". For visual variety, derive depth from index:

```tsx
{combat.enemies.map((enemy, i) => {
  const depth = Math.min(i * 0.3, 0.9)
  const shifts = [0, -36, 24, -48, 32]   // pre-baked horizontal jitter
  const shift = shifts[i] ?? 0
  return (
    <Enemy
      key={enemy.instanceId}
      style={{ '--depth': depth, '--enemy-shift': `${shift}px` }}
      ...
    />
  )
})}
```

## When all enemies are dead

`combat.phase` flips to `reward` and CombatScreen's reward branch takes over — the stage never has zero living enemies. Defeated enemies STAY in the column at `opacity: 0.25 grayscale(1)` until the reward screen replaces the whole view. This is good — the player sees the corpses.

## Mobile (DON'T TOUCH)

Mobile branch in CombatScreen uses `compact` mode for both EnemyCard and BodySlotPanel and stacks vertically. **Do not refactor mobile.** The new CombatScene renders ONLY for `!isMobile`.

## Container hierarchy

```tsx
<div className="combat-screen">                  // existing root, mostly unchanged
  <StrainMeter />                                // existing
  {isMobile ? <MobileLayout /> : <CombatScene>   // NEW: replaces the desktop top-section
    <StillColumn />
    <EnemyStage>
      {enemies.map(e => <EnemyCard ... />)}      // NEW EnemyCard
    </EnemyStage>
    <FloatingHud />                              // sector / round / info button
  </CombatScene>}
  <BodySlotPanel />                              // patched
  <Hand />                                       // unchanged
  <ExecuteRow />                                 // unchanged
</div>
```
