## Why

The heat system has been reworked six times in nine days and still feels shallow. The root cause is structural: equipment and block operate outside heat, so heat can always be optimized away. The optimal endgame play is literally "do nothing" — coast on equipment damage + block while heat decays. Every rework closed one escape hatch but opened another. Still's actual unique mechanic is the 4-slot body system (no other card game has spatial card-to-body-part assignment with equipment firing alongside). Heat should become a simple, boring foundation (like StS energy) so all design depth can go into slot decisions.

## What Changes

- **BREAKING**: Heat no longer accumulates across turns — it resets to 0 at the start of each turn, functioning as a per-turn energy budget
- **BREAKING**: Heat thresholds (Cool/Warm/Hot/Overheat) are removed entirely
- **BREAKING**: Ablative heat damage is removed
- **BREAKING**: Overheat damage is removed — you simply cannot overspend your budget
- **BREAKING**: Passive heat decay is removed (nothing to decay if it resets)
- **BREAKING**: All heat-zone-conditional card effects are removed (Cool bonuses, Hot bonuses, Pyromaniac/Cool Runner/Oscillator card designs)
- **BREAKING**: All heat-zone-conditional equipment effects are removed (Cryo Cannon, Meltdown Cannon, Heat Shield bonuses, etc.)
- **BREAKING**: Heat-reactive enemy intents are removed (Thermal Scanner's zone-based behavior)
- Heat budget per turn is a fixed value (e.g., 8) that can be increased by parts or equipment
- Cards cost heat (renamed to energy cost internally, displayed as heat thematically)
- LEGS equipment no longer provides cooling — LEGS gets a new role within the energy-per-turn model
- Heat projection UI simplified to "spent / budget" display

## Capabilities

### New Capabilities
- `energy-budget`: Per-turn energy budget system replacing accumulative heat — defines budget amount, reset behavior, and overspend rules

### Modified Capabilities
- `heat-system`: **BREAKING** — Complete rewrite. Heat thresholds, accumulation, ablative damage, overheat, and passive decay all removed. Heat becomes a per-turn budget that resets.
- `modifier-cards`: All heat-conditional card effects removed. Cards that referenced Cool/Warm/Hot zones need new designs. Cooling cards (Coolant Flush, Deep Freeze, etc.) are removed or reworked since there's nothing to cool.
- `body-actions`: Heat-conditional equipment effects removed. LEGS equipment no longer provides cooling. Equipment output no longer gated by heat zones.
- `card-system`: Heat-conditional bonus effects and threshold-gated playability removed. Sector pool cards that were archetype-seeding for heat zones need replacement.

## Impact

- `src/game/combat.ts` — Heat accumulation, threshold checks, ablative damage, overheat damage, passive decay, LEGS cooling all removed. Replaced with per-turn budget allocation and reset.
- `src/game/types.ts` — Heat-related types (HeatZone, threshold constants) removed or simplified. New energy budget fields.
- `src/data/cards.ts` — Every card with heat-zone conditions, cooling effects, or zone-specific bonuses needs rework. Estimated 15+ cards affected.
- `src/data/equipment.ts` — Every equipment piece with heatCondition, heatConditionOnly, or zone bonuses needs rework. Estimated 10+ equipment affected.
- `src/data/enemies.ts` — Heat-reactive enemy (Thermal Scanner) intents removed or reworked.
- `src/components/CombatScreen.tsx` — Heat projection UI, threshold warnings, ablative heat display all simplified to budget display.
- `src/components/StillPanel.tsx` — Heat zone indicators, ablative heat compact display removed. Replaced with budget meter.
- `src/components/EnemyCard.tsx` — Heat-reactive intent display removed.
