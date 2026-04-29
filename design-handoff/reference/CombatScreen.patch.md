# Patch: src/components/CombatScreen.tsx

Two changes only — both in the desktop branch of the main render. The mobile branch and all logic above it stay untouched.

## Change 1: Add import

At the top of the file, alongside the other component imports, add:

```tsx
import CombatScene from './CombatScene'
```

You can REMOVE the existing import of `StillPanel` from the desktop path (it's still used by mobile, so keep the import line itself if mobile branch references it — check before deleting).

## Change 2: Replace the desktop top-section

In the main return block, find the line:

```tsx
      ) : (
        // Desktop: side-by-side
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <StillPanel ... />
            ...
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            ...
            {combat.enemies.map(enemy => { ... })}
          </div>
        </div>
      )}
```

Replace the entire `Desktop: side-by-side` div (from `<div style={{ display: 'flex', gap: '16px', ... }}>` through its closing `</div>`) with:

```tsx
      ) : (
        <CombatScene
          combat={combat}
          run={{
            health: run.health,
            maxHealth: run.maxHealth,
            sector: run.sector,
            combatsCleared: run.combatsCleared,
          }}
          displayHealth={displayHealth}
          displayBlock={displayBlock}
          displayEnemyHealth={displayEnemyHealth}
          effectiveTarget={effectiveTarget}
          damageNumbers={damageNumbers}
          onTarget={setTargetEnemyId}
          onOpenInfo={() => setInfoTab('equips')}
        />
      )}
```

## Change 3: Move the StrainMeter into the stage (optional, but recommended)

The existing `<StrainMeter current={combat.strain} max={combat.maxStrain} />` line at the top of the desktop layout becomes redundant — `CombatScene` renders its own thin strain meter overlaid on the stage.

Decision per platform:

- **Desktop**: remove the outer `<StrainMeter>` (the in-stage one is enough).
- **Mobile**: keep the outer `<StrainMeter>` (mobile doesn't use CombatScene).

Easiest pattern:

```tsx
{isMobile && <StrainMeter current={combat.strain} max={combat.maxStrain} />}
```

## Change 4: Round-info text in Execute row

The bottom `Sector X · Round Y` line below the Execute button becomes redundant (now in the stage HUD). On desktop, remove it. On mobile, keep it.

```tsx
{isMobile ? (
  <>...sticky mobile bar (unchanged)...</>
) : (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
    <button onClick={handleExecute} ...>EXECUTE</button>
  </div>
  // The bottom Sector/Round/Info row is removed on desktop.
)}
```

## Verify after patching

1. `npm run dev` — combat should render with the new stage layout.
2. Click an enemy — yellow ▾ caret appears, sprite gets a yellow glow.
3. Long-press an enemy (~400ms hold) — inspector popover appears with full info.
4. Right-click an enemy — same as long-press.
5. Click an empty area — inspector dismisses.
6. Press Escape with inspector open — dismisses.
7. Execute a turn — damage numbers float over the right enemy, HP bars animate, defeated enemies fade to grey.
8. Mobile (resize to <600px) — old layout, untouched.
