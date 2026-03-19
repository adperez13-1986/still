## REMOVED Requirements

### Requirement: Modifier cards can have heat-conditional bonus effects
**Reason**: Duplicate of modifier-cards spec removal. Heat-conditional bonuses no longer exist.
**Migration**: See modifier-cards delta spec.

### Requirement: Sector 1 card pool includes archetype-seeding cards
**Reason**: Duplicate of modifier-cards spec removal. Heat-zone archetypes no longer exist.
**Migration**: See modifier-cards delta spec.

## MODIFIED Requirements

### Requirement: Card upgrades
Modifier cards in the player's deck SHALL be upgradeable at rest rooms, improving their effects.

#### Scenario: Upgrading a card at rest
- **WHEN** the player chooses to upgrade at a rest room
- **THEN** they select one modifier card from their deck; the card is permanently enhanced for the rest of the run (lower energy cost, increased effect magnitude, or added secondary effect)
