## 1. Pass combatsCleared to Combat

- [x] 1.1 Add `combatsCleared: number` to `CombatContext` interface in `combat.ts`
- [x] 1.2 Pass `state.combatsCleared` when constructing `CombatContext` in `runStore.ts` (all ctx construction sites)

## 2. Apply Scaling

- [x] 2.1 In `executeEnemyTurn` in `combat.ts`, after `let dealt = intent.value` for Attack/AttackDebuff intents, apply scaling: `dealt = Math.floor(dealt * scalingMultiplier)` where multiplier is `1.10` for bosses, or `1 + max(0, combatsCleared - 3) * 0.10` for regular enemies

## 3. Multi-Hit Attacks

- [x] 3.1 Add optional `hits?: number` field to `Intent` interface in `types.ts`
- [x] 3.2 In `executeEnemyTurn`, loop Attack/AttackDebuff resolution `hits` times (default 1) — each hit applies block/ablative/damage independently
- [x] 3.3 Update `IntentDisplay` in `EnemyCard.tsx` to show `value×hits` when hits > 1
- [x] 3.4 Update Hollow Repeater: replace 3-turn Attack(3) cycle with Attack(3, hits:3), Block(4)
- [x] 3.5 Update Fracture Mite: replace Attack(4), Attack(4) with Attack(3, hits:2), Attack(3, hits:2)

## 4. Telegraphed Big Hits

- [x] 4.1 Update Glitch Node: change from Buff(Str), Attack(8), Attack(8) to Buff(Str), Buff(Str), Attack(10) — two buffs then one big swing

## 5. Verification

- [x] 5.1 Playtest: verify early combats (1-3) feel unchanged — confirmed, early combats fine
- [x] 5.2 Playtest: verify late combats (7+) deal noticeably more damage — confirmed, fresh player reached boss with 11 HP and lost
- [x] 5.3 Playtest: verify multi-hit attacks make block less efficient — confirmed via Strength interaction
- [x] 5.4 Playtest: verify Glitch Node creates kill-fast urgency — confirmed
