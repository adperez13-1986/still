## ADDED Requirements

### Requirement: Heal comfort reward

The Heal reward SHALL restore HP to the player immediately.

#### Scenario: Heal applied
- **WHEN** the player selects the Heal comfort reward
- **THEN** the player heals 8 HP (capped at max health)

### Requirement: Relief comfort reward

The Relief reward SHALL reduce the player's current strain.

#### Scenario: Relief applied
- **WHEN** the player selects the Relief comfort reward
- **THEN** strain decreases by 4 (minimum 0)

### Requirement: Companion moment comfort reward

The Companion moment reward SHALL reduce strain and display narrative text.

#### Scenario: Companion moment applied
- **WHEN** the player selects the Companion moment comfort reward
- **THEN** strain decreases by 2 and a short narrative text is displayed (placeholder for prototype)

#### Scenario: Companion moment narrative
- **WHEN** a Companion moment is displayed
- **THEN** the text reflects a brief moment of presence or warmth (not mechanical — thematic placeholder)
