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

## 7. Verification

- [ ] 7.1 Playtest a full combat at Warm (4-6) — verify no bonuses, baseline behavior
- [ ] 7.2 Playtest entering Hot (7-9) — verify self-damage, no universal bonus, equipment bonuses work
- [ ] 7.3 Playtest overheat during execution — verify damage per tick, LEGS cooling, no shutdown
- [ ] 7.4 Playtest overheat during planning — verify damage when playing cards past heat 9
