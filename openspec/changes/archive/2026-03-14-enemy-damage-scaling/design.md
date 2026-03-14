## Context

Enemy damage is static — the same enemy deals the same damage whether it's the 1st or 9th combat of a sector. Combined with block values that comfortably cover most incoming hits, mid-sector combats feel risk-free. Only bosses pose a real threat.

`combatsCleared` is already tracked on `RunState` (added for maze collapse). The scaling formula uses this counter.

## Goals / Non-Goals

**Goals:**
- Make later combats in a sector progressively more dangerous
- Create urgency to route efficiently (every extra combat makes the next one harder)
- Keep early game accessible (grace period of 3 combats)

**Non-Goals:**
- Scaling enemy HP (only damage scales)
- Scaling block or buff values
- Changing enemy composition or adding new enemies
- Per-sector multiplier differences (same formula for all sectors)

## Decisions

### 1. Scaling formula applied at damage resolution, not at enemy definition

Apply the multiplier inside `executeEnemyTurn` when calculating `dealt` for Attack/AttackDebuff intents. This keeps enemy definitions clean and the scaling centralized.

**Insertion point:** `combat.ts` line 1053, after `let dealt = intent.value`, before Strength/Weak modifiers. The scaling multiplies the base intent value, then Strength adds flat and Weak/Vulnerable multiply on top. This means scaling compounds with status effects, which is intentional — late-game enemies hitting a Vulnerable player should hurt.

### 2. `combatsCleared` added to CombatContext

Add `combatsCleared: number` to `CombatContext`. Passed from `RunState` when constructing context in `runStore.ts`. This avoids polluting `CombatState` with run-level data.

### 3. Boss check via `isBoss` on EnemyDefinition

The enemy definition already has `isBoss?: boolean`. Use this to apply the flat 10% boss multiplier instead of the ramping formula.

## Risks / Trade-offs

- **Risk:** Scaling + Vulnerable + Strength could spike damage too high in late combats → Mitigation: 10% per combat is conservative; monitor via playtesting
- **Trade-off:** Block doesn't scale with enemies, so it becomes less effective over time — this is intentional and creates the "HP as resource" pressure
