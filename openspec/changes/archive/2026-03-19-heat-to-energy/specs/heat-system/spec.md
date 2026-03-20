## REMOVED Requirements

### Requirement: Heat is the central combat resource
**Reason**: Replaced by per-turn energy budget system. Heat no longer accumulates across turns.
**Migration**: All heat accumulation logic replaced by energy-budget capability. The "Heat" name is retained in UI only.

### Requirement: Heat thresholds govern combat bonuses and penalties
**Reason**: Cool/Warm/Hot/Overheat zones removed entirely. No zone-based conditions exist.
**Migration**: All equipment and card effects that reference heat zones (heatCondition, heatBonus, heatBonusThreshold) are removed or reworked to unconditional effects.

### Requirement: No free passive cooling
**Reason**: With per-turn energy reset, cooling is meaningless. There is nothing to cool.
**Migration**: LEGS equipment reworked from cooling to utility effects (card draw, cycling, block).

### Requirement: Overheat damage applies on any heat increase while over 9
**Reason**: Overheat mechanic removed. Players cannot overspend their energy budget — the constraint is simply "not enough energy" rather than "damage for exceeding a threshold."
**Migration**: Remove all overheat damage calculations from combat.ts.

### Requirement: Ablative heat absorbs damage while Hot
**Reason**: Ablative heat removed with heat zones. No Hot zone exists to trigger ablation.
**Migration**: Remove ablative heat logic from combat.ts and StillPanel display.

### Requirement: Heat is generated only during the planning phase
**Reason**: Replaced by energy spending during planning phase. The mechanic is similar (spend resource when playing cards) but resets each turn instead of accumulating.
**Migration**: Replace heat generation with energy spending in combat.ts planning phase logic.

### Requirement: Projected Heat display
**Reason**: Replaced by simpler energy display (available/maximum). No threshold warnings needed since there are no thresholds.
**Migration**: Replace heat projection UI with energy budget display.
