## MODIFIED Requirements

### Requirement: Post-combat reward choice

After combat victory, the player chooses between growth (new action, costs strain) or comfort (immediate relief, free).

#### Scenario: Reward screen layout
- **WHEN** the reward screen appears
- **THEN** it shows up to 3 growth options (findable actions) and 1 comfort option

#### Scenario: After choosing growth
- **WHEN** the player selects a growth action
- **THEN** strain increases, then the slot placement screen appears. Player chooses which slot to place the new action in, sees synergy previews for each possible position.

#### Scenario: Comfort rewards unchanged
- **WHEN** the player selects comfort
- **THEN** Heal (8 HP), Relief (-4 strain), or Companion moment (-2 strain + text) applies. Contextual based on HP and strain.
