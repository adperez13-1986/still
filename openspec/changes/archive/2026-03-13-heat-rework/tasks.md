## 1. Heat Threshold Constants

- [x] 1.1 Update `getHeatThreshold()` in types.ts: Cool 0-3, Warm 4-6, Hot 7-9, Overheat 10+
- [x] 1.2 Remove `HEAT_MAX = 10` cap — heat has no upper limit, only minimum 0
- [x] 1.3 Update any heat-related constants (HOT_DAMAGE, OVERHEAT_RESET, etc.) for new model

## 2. Overheat Damage System

- [x] 2.1 Create overheat damage function: on any heat increase, if new heat > 9, deal 3 × (newHeat - 9) damage to player
- [x] 2.2 Route all heat increases through a single choke point that triggers the overheat damage check (card plays, slot firing, equipment heat generation)
- [x] 2.3 Verify LEGS cooling does not trigger overheat damage (cooling is a decrease, not increase)

## 3. Remove Shutdown

- [x] 3.1 Remove shutdown flag and shutdown turn logic from combat.ts
- [x] 3.2 Remove overheat-reset-to-5 behavior
- [x] 3.3 Remove system-cards-only restriction during shutdown turns
- [x] 3.4 Remove shutdown-related UI (shutdown indicators, "shutdown next turn" warnings)

## 4. Remove Universal Threshold Bonus

- [x] 4.1 Remove `getThresholdBonus()` function and its call from `resolveBodyAction` in combat.ts
- [x] 4.2 Remove threshold bonus from `projectSlotActions` heat projection
- [x] 4.3 Verify equipment-specific heat bonuses (heatBonusThreshold/heatBonusValue) still work independently

## 5. Heat-Conditional Audit

- [x] 5.1 Audit parts.ts — update any parts referencing old thresholds (Pressure Valve, Reactive Frame, etc.). Pressure Valve needs redesign since shutdown no longer exists.
- [x] 5.2 Audit cards.ts — update any cards with heat-conditional effects for new threshold values
- [x] 5.3 Audit equipment definitions in parts.ts — verify heatBonusThreshold values still make sense with new boundaries
- [x] 5.4 Grep for hard-coded heat magic numbers (4, 5, 7, 8) in combat-related code

## 6. UI Updates

- [x] 6.1 Update heat projection warnings for new thresholds (Hot at 7+, Overheat at 10+)
- [x] 6.2 Show projected overheat damage in UI when projected heat exceeds 9
- [x] 6.3 Update heat bar/indicator visuals for new threshold boundaries
- [x] 6.4 Remove shutdown-related UI messaging

## 7. Overheat Damage Tuning

- [x] 7.1 Update `OVERHEAT_DAMAGE_PER_POINT` from 3 to 2 in types.ts (or wherever the constant lives)
- [x] 7.2 Update any UI text/tooltips that reference "3 damage per point" to "2 damage per point"

## 8. Remove Free Passive Cooling

- [x] 8.1 Remove `PASSIVE_COOLING` constant from types.ts
- [x] 8.2 Remove `applyPassiveCooling()` function from types.ts
- [x] 8.3 Remove all `passiveCoolingBonus` references from runStore.ts (state field, initialization, combat context)
- [x] 8.4 Remove passive cooling call from end-of-turn resolution in combat.ts
- [x] 8.5 Remove passive cooling from heat projection in CombatScreen.tsx
- [x] 8.6 Remove or repurpose the `passiveCooling` fragment bonus type (FragmentScreen, RunScreen)
- [x] 8.7 Update test harness (HeatGauge, TestHarness, ScenarioBuilder) to remove passive cooling references

## 9. Ablative Heat

- [x] 9.1 Implement ablative heat in damage resolution: when Still is Hot (7+) and takes damage (after block), absorb at 1:2 ratio (floor(damage/2) heat, max drain to heat 4). Reduce damage by absorbed × 2.
- [x] 9.2 Add ablative heat to damage projection/preview so player can see the buffer
- [x] 9.3 Add combat log entry for ablative heat absorption (e.g., "Heat absorbed 10 damage (heat 9 → 4)")
- [x] 9.4 Verify ablative heat applies AFTER block but BEFORE HP damage

## 10. Hot Draw Card

- [x] 10.1 Add a Hot draw card to card pool (draw 2 base, draw 3 while Hot) — mirror of Cold Efficiency
- [x] 10.2 Add to appropriate sector pool(s)

## 11. Verification

- [x] 11.1 Playtest Cool archetype — verify LEGS cooling is required to stay Cool, no free passive cooling
- [x] 11.2 Playtest Hot archetype — verify ablative heat absorbs damage, overheat at 2/point feels right
- [x] 11.3 Playtest pushing into overheat (10-12) — verify ablative buffer math, cost/benefit decision
- [x] 11.4 Playtest Warm — verify no passive cooling drift, Warm is stable without effort
