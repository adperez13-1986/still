## Delta: applyStatus enemy targeting

### Changed Requirements

- `applyStatus` system effects MUST support `target: 'self' | 'all_enemies'`
- When target is `'all_enemies'`, status is applied to all non-defeated enemies
- When target is `'self'`, status is applied to the player (unchanged behavior)
