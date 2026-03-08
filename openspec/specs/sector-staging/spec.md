## Requirements

### Requirement: Staging area appears between sectors
When the player defeats a non-final sector boss, a staging area screen SHALL appear instead of ending the run. The player's deck, equipment, parts, shards, and health carry over.

#### Scenario: Boss defeated in non-final sector
- **WHEN** all enemies are defeated in a boss combat and the current sector is less than 3
- **THEN** the staging area screen is shown instead of the victory/run-end flow

#### Scenario: Final sector boss triggers normal victory
- **WHEN** all enemies are defeated in the final sector (Sector 3) boss combat
- **THEN** the existing victory flow triggers (end run, return to workshop)

### Requirement: Staging area provides full heal
The staging area SHALL fully restore the player's health.

#### Scenario: Player healed to full
- **WHEN** the staging area loads
- **THEN** the player's health is restored to maxHealth

### Requirement: Staging area allows card upgrade
The staging area SHALL allow the player to upgrade one card in their deck.

#### Scenario: Player upgrades a card
- **WHEN** the player selects a non-upgraded card during the upgrade step
- **THEN** the card is upgraded and the player advances to the next step

#### Scenario: Player skips upgrade
- **WHEN** the player chooses to skip the upgrade step
- **THEN** no card is upgraded and the player advances to the next step

### Requirement: Staging area allows card removal
The staging area SHALL allow the player to permanently remove one card from their deck.

#### Scenario: Player removes a card
- **WHEN** the player selects a card during the removal step
- **THEN** the card is permanently removed from the deck

#### Scenario: Minimum deck size enforced
- **WHEN** the player's deck has 5 or fewer cards
- **THEN** the removal step is automatically skipped

#### Scenario: Player skips removal
- **WHEN** the player chooses to skip the removal step
- **THEN** no card is removed

### Requirement: Staging area provides bonus reward
The staging area SHALL offer a choice of one bonus reward from the next sector's content pool.

#### Scenario: Player chooses a card reward
- **WHEN** the player selects the card option
- **THEN** 3 cards from the next sector's card pool are shown, and the player picks one to add to their deck

#### Scenario: Player chooses a part reward
- **WHEN** the player selects the part option
- **THEN** a random behavioral part from the next sector's pool is added

#### Scenario: Player chooses an equipment reward
- **WHEN** the player selects the equipment option
- **THEN** a random equipment piece from the next sector's pool is offered (with equip/compare flow if slot is occupied)

### Requirement: Continuing to the next sector generates a new maze
After the staging area is complete, a new maze SHALL be generated for the next sector.

#### Scenario: Advancing to next sector
- **WHEN** the player clicks "Continue" after completing all staging steps
- **THEN** the sector counter increments, a new maze is generated, and the map screen loads
