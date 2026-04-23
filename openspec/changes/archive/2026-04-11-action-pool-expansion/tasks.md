## 1. Add Damage Actions

- [x] 1.1 Add `ACTION_QUICK_JABS` (damage_single, 2/3, hits: 3) to src/data/actions.ts
- [x] 1.2 Add `ACTION_HEAVY_BLOW` (damage_single, 4/14) to src/data/actions.ts
- [x] 1.3 Add `ACTION_SPLASH` (damage_all, 3/5) to src/data/actions.ts
- [x] 1.4 Add `ACTION_FLURRY` (damage_all, 2/3, hits: 2) to src/data/actions.ts

## 2. Add Defense Actions

- [x] 2.1 Add `ACTION_IRON_WALL` (block, 2/5, persistent) to src/data/actions.ts
- [x] 2.2 Add `ACTION_GUARD` (reduce, 2/4, perHit) to src/data/actions.ts
- [x] 2.3 Add `ACTION_THORNSKIN` (reflect, 30/50, reflectPct: 30) to src/data/actions.ts

## 3. Add Sustain Actions

- [x] 3.1 Add `ACTION_STITCH` (heal, 3/5) to src/data/actions.ts
- [x] 3.2 Add `ACTION_REGEN` (heal, 1/2, healOverTurns: 3) to src/data/actions.ts
- [x] 3.3 Add `ACTION_RECHARGE` (convert, 4/6) to src/data/actions.ts

## 4. Add Utility Actions

- [x] 4.1 Add `ACTION_RALLY` (buff, 5/7) to src/data/actions.ts
- [x] 4.2 Add `ACTION_CRIPPLE` (debuff, 4/6) to src/data/actions.ts

## 5. Pool Registration

- [x] 5.1 Add all 12 new actions to the `FINDABLE_ACTIONS` array in src/data/actions.ts
- [x] 5.2 Verify `ALL_ACTIONS` record automatically picks up new entries (it's derived from `FINDABLE_ACTIONS`)

## 6. Verification

- [x] 6.1 `npx tsc -p tsconfig.app.json --noEmit` passes
- [x] 6.2 `npx vite build` succeeds
- [x] 6.3 Single-combat sim: 100% win rate maintained
- [x] 6.4 Full S1 sim: victory rate 20.7% → 29.7%, action acquisition diversified (quick-jabs 67%, barrier 49%, regen 42%, stitch 37%). Top 3 damage picks are slightly above the 60% target but overall distribution is much more even.
- [x] 6.5 Manual playtest: reward screens do show a mix of new and existing actions

## 7. Post-implementation findings

**What the content addition delivered (good):**
- Sim victory rate improved: 20.7% → 29.7% (balanced profile) just from adding actions
- Action acquisition spread diversified: barrier went from 9% → 49% picks, regen 42%, stitch 37%
- Multi-hit actions (Quick Jabs, Flurry) have measurably different take patterns vs single-hit damage
- Heavy Blow's identity as a commitment action reads clearly in sims: 43% acquisition with aggressive profile, ~0% with defensive profile

**What content alone did NOT fix (lesson):**
- Adding 12 more actions didn't resolve the "rewards feel the same" problem surfaced in play
- Because synergies are type-based, a second damage_single feels like "bigger Strike" not "different playstyle"
- 5 slots still constrains build variety; owning 21 findable actions is mostly shelved
- The working theory "content density will create build identity" was wrong — the ceiling is set by the slot + synergy design, not the action count

**Superseded direction:** These findings plus the unified-action-slots playtest findings together argue for a structural reframe (dynamic loadouts: swap actions per turn from the full owned pool). The content expansion stands as useful raw material for that future system, since a bigger pool has more value when per-turn selection matters.
