## Approach

Add a small sector badge/label to the top area of both the RunScreen (map view) and CombatScreen. Read `run.sector` from the store, which is already available in both components.

## Key Decisions

- **Inline label, not a separate component**: A styled `<span>` is sufficient — no need for a dedicated component for a single label.
- **Placement**: Near the top of each screen, alongside existing header info (health bar area). Consistent styling between map and combat.
- **Styling**: Subtle pill/badge style — sector number with muted background, not overly prominent but always visible.

## Implementation

1. RunScreen: Add sector label near the top header area where health/shards are shown
2. CombatScreen: Add sector label in the top info bar alongside heat/block/health
