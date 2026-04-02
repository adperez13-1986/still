## MODIFIED Requirements

### Requirement: Post-combat reward choice

After a combat victory, the game SHALL present a reward screen with up to two options: one growth reward and one comfort reward.

#### Scenario: Growth option drawn from dependency-aware pool
- **WHEN** the reward screen needs a growth option
- **THEN** the game filters the tree for rewards whose prerequisites are met, that haven't been acquired, and that are affordable. One is selected from this filtered list.

#### Scenario: Growth unavailable due to high strain
- **WHEN** no affordable growth reward exists (all available rewards would push strain to 20+)
- **THEN** only comfort is offered

#### Scenario: Growth pool exhausted
- **WHEN** all 17 growth rewards have been acquired OR all remaining rewards have unmet prerequisites
- **THEN** only comfort is offered

#### Scenario: Dependency unlocking progression
- **WHEN** the player acquires a tier 1 reward in fight 2
- **THEN** fight 3's reward screen may offer a tier 2 reward that depends on it
