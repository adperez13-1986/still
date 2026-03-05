## MODIFIED Requirements

### Requirement: Still's base stats
Still SHALL have three core stats: Health (maximum and current), Heat (0-10, the central combat resource), and Block (resets each turn, absorbs incoming damage before health). Energy is removed as a stat.

#### Scenario: Heat replaces energy
- **WHEN** the player wants to play modifier cards or push body actions
- **THEN** the constraint is Heat accumulation and thresholds, not an energy pool

#### Scenario: Block absorbs damage
- **WHEN** Still would receive damage while Block > 0
- **THEN** Block is reduced first; only damage exceeding current Block reduces Health

#### Scenario: Block resets each turn
- **WHEN** Still's turn begins
- **THEN** Block is reset to zero before the planning phase

### Requirement: Parts system (passive identity)
Still SHALL have a Parts inventory representing what it has become through its journey. Each part is a passive behavioral modifier — not a flat stat bonus. Parts create conditional interactions with body actions, modifier cards, and Heat state.

#### Scenario: Acquiring a part as a reward
- **WHEN** the player selects a part from a post-combat reward screen
- **THEN** the part is added to Still's active parts for the current run, and its behavioral effect is active immediately

#### Scenario: Parts modify body action behavior
- **WHEN** a part's trigger condition is met during combat (e.g., "when TORSO action fires" or "when Heat is Warm+")
- **THEN** the part's effect activates (e.g., gain extra Block, action fires twice, reduce Heat cost of modifiers)

#### Scenario: Parts do not provide flat stat bonuses
- **WHEN** a part is equipped
- **THEN** it does not directly modify max health, energy cap, draw count, or other base stats — it provides conditional effects that activate during combat

### Requirement: Equipables system (active expression)
Still SHALL have four equipment slots (HEAD, TORSO, ARMS, LEGS) that generate automatic combat actions each turn. Each slot governs a specific domain. Equipping an item in a slot determines the specific action that slot produces.

#### Scenario: Equipping an item defines the slot's action
- **WHEN** the player equips an item into an equipment slot
- **THEN** that slot generates the equipped item's action each turn during combat

#### Scenario: Replacing an equipped item changes the action
- **WHEN** the player equips a new item into an already-occupied slot
- **THEN** the previous item is replaced and the slot's action changes to the new item's action

#### Scenario: Empty slot produces no action
- **WHEN** an equipment slot has no item equipped
- **THEN** it produces no action during the execution phase and generates no Heat

### Requirement: Still starts incomplete
At the beginning of every run, Still SHALL start with only a TORSO slot filled — a single Scrap Plating that provides a basic Block action. All other slots (HEAD, ARMS, LEGS) start empty. The player builds Still's body by finding equipment during the run.

#### Scenario: New run initial state
- **WHEN** a new run begins
- **THEN** Still has base health of 70, Heat at 0, TORSO equipped with Scrap Plating (gain 3 Block), HEAD/ARMS/LEGS empty, no parts, and a starting modifier deck of 8 cards

#### Scenario: No damage without ARMS or Override cards
- **WHEN** a run begins and ARMS is empty
- **THEN** Still cannot deal damage through body actions and must rely on Emergency Strike override modifier cards to deal damage

#### Scenario: Finding equipment changes combat capability
- **WHEN** the player equips a new item in a previously empty slot
- **THEN** a new body action becomes available each turn, expanding Still's combat capability and increasing Heat generation per turn

## REMOVED Requirements

### Requirement: Still's base stats (energy references)
**Reason**: Energy as a stat is removed. Heat replaces it as the central resource constraint. The original requirement specified "Energy (restored each turn, used to play cards)" — this no longer applies.
**Migration**: All references to energy in combat logic are replaced with Heat mechanics. See `heat-system` spec.
