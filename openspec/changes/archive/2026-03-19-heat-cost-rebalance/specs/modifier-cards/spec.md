## MODIFIED Requirements

### Requirement: Starting modifier deck
Every run SHALL begin with a standard set of 8 basic modifier cards with energy costs balanced around a 2-energy baseline.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** Still's deck contains exactly: 3x Boost (2 energy), 1x Emergency Strike (2 energy), 1x Emergency Shield (2 energy), 2x Vent (2 energy), 1x Diagnostics (2 energy)

### Requirement: Card upgrade cost reduction
Upgrading a card SHALL reduce its energy cost by 1 (minimum 0).

#### Scenario: Upgrading a 2-energy starter
- **WHEN** the player upgrades a Boost (2 energy)
- **THEN** Boost+ costs 1 energy

### Requirement: Pool cards at 1 energy are raised to 2 energy
Cards in the sector pools that currently cost 1 energy SHALL be raised to 2 energy to match the baseline.

#### Scenario: Field Repair and Cold Efficiency
- **WHEN** Field Repair or Cold Efficiency appears in the card pool
- **THEN** their base cost is 2 energy (upgraded: 1 energy)
