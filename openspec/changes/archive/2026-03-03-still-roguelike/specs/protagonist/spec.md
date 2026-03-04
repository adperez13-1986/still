## ADDED Requirements

### Requirement: Still's base stats
Still SHALL have three core stats: Health (maximum and current), Energy (restored each turn, used to play cards), and Block (resets each turn, absorbs incoming damage before health).

#### Scenario: Energy used to play cards
- **WHEN** the player plays a card with a cost of N
- **THEN** Still's current energy is reduced by N; if insufficient energy, the card cannot be played

#### Scenario: Block absorbs damage
- **WHEN** Still would receive damage while Block > 0
- **THEN** Block is reduced first; only damage exceeding current Block reduces Health

#### Scenario: Block resets each turn
- **WHEN** Still's turn begins
- **THEN** Block is reset to zero before drawing cards

### Requirement: Parts system (passive identity)
Still SHALL have a Parts inventory representing what it has become through its journey. Each part is a passive modifier salvaged from defeated enemies. Parts do not expire between runs — once equipped, they persist for the duration of the run.

#### Scenario: Acquiring a part as a reward
- **WHEN** the player selects a part from a post-combat reward screen
- **THEN** the part is added to Still's active parts for the current run, and its passive effect immediately applies

#### Scenario: Parts modify base stats
- **WHEN** a part with a stat modifier is equipped
- **THEN** Still's relevant stat (max health, energy cap, draw count, etc.) is updated accordingly

#### Scenario: Parts can modify behavior
- **WHEN** a part with a behavioral modifier is equipped (e.g., "gain 2 Block at start of each turn")
- **THEN** that effect triggers automatically at the defined point in the combat loop

### Requirement: Equipables system (active expression)
Still SHALL have a limited number of equipment slots for Equipables. Equipables grant both passive stats and active skills usable in combat. Equipables are more powerful than parts but occupy named slots (e.g., Head, Torso, Arms, Legs).

#### Scenario: Equipping an item in a slot
- **WHEN** the player equips an Equipable into an available slot
- **THEN** the Equipable's passive stats apply and its active skill becomes available in combat

#### Scenario: Replacing an equipped item
- **WHEN** the player equips an Equipable into an already-occupied slot
- **THEN** the previous item is unequipped (returned to inventory or lost, based on run rules) and the new item takes effect

#### Scenario: Using an Equipable skill in combat
- **WHEN** the player activates an Equipable's skill during their turn
- **THEN** the skill effect is applied and a cooldown or charge cost is triggered (if any)

### Requirement: Still starts incomplete
At the beginning of every run, Still SHALL start with only a basic chassis — minimal stats and no equipped parts or equipables beyond the default. The player builds Still's identity through each run.

#### Scenario: New run initial state
- **WHEN** a new run begins
- **THEN** Still has base health of 70, base energy of 3 per turn, no parts, no equipables, and a standard starting deck
