## REMOVED: Heat System

**Reason**: The heat system was fully removed and replaced with an energy system. See `combat-system/spec.md` for the current energy model (8E max, 2E baseline per slot).

**Migration**: All heat costs replaced with energy costs. Heat thresholds, heat zones, overheat, and cooling mechanics no longer exist. Cards now have `energyCost` (non-negative integer) instead of heat costs.
