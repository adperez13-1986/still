## Delta: applyStatus enemy targeting

### Changed Requirements

- `applyStatus` system effects MUST support `target: 'self' | 'all_enemies'`
- When target is `'all_enemies'`, status is applied to all non-defeated enemies
- When target is `'self'`, status is applied to the player (unchanged behavior)

### Requirement: Part drops are unique
Parts offered as combat rewards SHALL exclude parts the player already owns. A player SHALL never possess duplicate copies of the same part.

#### Scenario: Part already owned
- **WHEN** a part drop is resolved and the player already owns that part
- **THEN** that part is excluded from the drop pool and a different part or fallback reward is given
