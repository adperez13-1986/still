## ADDED Requirements

### Requirement: Berserker modifier — Reckless Boost

#### Scenario: Reckless Boost assigned to slot
- **WHEN** Reckless Boost (Amplify, 2E, Arms/Torso) is assigned to a slot
- **THEN** the slot's output is multiplied by 2.5x (+150%) AND the player takes 5 damage during execution

### Requirement: Berserker modifier — Overclock Slot

#### Scenario: Overclock Slot assigned
- **WHEN** Overclock Slot (2E, any slot) is assigned to a slot
- **THEN** the slot fires 3 times during execution AND the slot is added to `disabledSlots` for the next turn

### Requirement: Berserker system card — Burnout (Power-type)

#### Scenario: Burnout played
- **WHEN** Burnout (System, 2E, homeSlot Arms, Exhaust) is played
- **THEN** a permanent combat flag `burnoutActive` is set. At the start of each subsequent turn, the player loses 3 HP and gains 2 Strength.

### Requirement: Berserker system card — Shutdown

#### Scenario: Shutdown played targeting a slot
- **WHEN** Shutdown (System, freePlay, 0E, Exhaust) is played and the player selects one of their own body slots
- **THEN** that slot is disabled for this turn AND the player gains 3 energy

### Requirement: Exhaust modifier — Scrap Charge

#### Scenario: Scrap Charge assigned to slot
- **WHEN** Scrap Charge (Amplify, 2E, Arms/Torso) is assigned to a slot
- **THEN** the slot's output is multiplied by (1 + 0.25 * exhaustPile.length). At 0 exhausted = 1x (no bonus). At 4 exhausted = 2x. At 8 exhausted = 3x.

### Requirement: Exhaust modifier — Jettison

#### Scenario: Jettison assigned to slot
- **WHEN** Jettison (Override, 2E, any slot) is assigned to a slot
- **THEN** during execution, the player exhausts up to 3 cards from their hand and deals 6 damage per card exhausted to the targeted enemy. Cards exhausted this way trigger onCardExhaust part effects.

### Requirement: Exhaust modifier — Residual Charge

#### Scenario: Residual Charge assigned to slot
- **WHEN** Residual Charge (Repeat, 2E, any slot) is assigned to a slot
- **THEN** the slot fires 1 + floor(exhaustPile.length / 3) times, maximum 4 total firings

### Requirement: Counter modifier — Cross-Wire

#### Scenario: Cross-Wire assigned to Arms
- **WHEN** Cross-Wire (2E, Arms only) is assigned to Arms
- **THEN** Arms gains bonus damage equal to the Torso equipment's base block value. If no Torso equipment, bonus is 0.

### Requirement: Counter modifier — Iron Curtain

#### Scenario: Iron Curtain assigned to Torso
- **WHEN** Iron Curtain (3E, Torso only) is assigned to Torso
- **THEN** Torso's block output is multiplied by 3x (+200%) AND Retaliate is activated for this turn

### Requirement: Counter modifier — Absorb

#### Scenario: Absorb assigned to Torso
- **WHEN** Absorb (2E, Torso only) is assigned to Torso
- **THEN** after all block is gained this turn, the player heals HP equal to 50% of total block gained (floored)

### Requirement: Counter modifier — Volatile Armor

#### Scenario: Volatile Armor assigned to Torso
- **WHEN** Volatile Armor (2E, Torso only) is assigned to Torso and an enemy attack breaks through the player's block
- **THEN** the amount of block consumed by that attack is dealt as damage to the attacker (in addition to any Retaliate/Thorns/Voltage effects)

### Requirement: Stat modifier — Reinforce

#### Scenario: Reinforce assigned to Torso
- **WHEN** Reinforce (Amplify, 2E, Torso only) is assigned to Torso
- **THEN** the Dexterity bonus applied to Torso's block action is tripled (3x Dex instead of 1x Dex)

### Requirement: Bridge modifier — Linked Fire

#### Scenario: Linked Fire assigned to Arms
- **WHEN** Linked Fire (2E, Arms only) is assigned to Arms
- **THEN** Arms gains bonus damage equal to the Legs equipment's base action value. If no Legs equipment, bonus is 0.

### Requirement: Bridge modifier — Redirect Power

#### Scenario: Redirect Power assigned to a slot
- **WHEN** Redirect Power (2E, any slot) is assigned to a slot
- **THEN** the slot fires its own action, then fires a second time using the adjacent slot's equipment action type and base value. Adjacency: Head↔Torso, Arms↔Legs. If the adjacent slot has no equipment, only the first firing occurs.

### Requirement: Bridge modifier — Feedback Loop

#### Scenario: Feedback Loop assigned to a slot
- **WHEN** Feedback Loop (Repeat, 2E, any slot) is assigned to a slot
- **THEN** the slot fires 1 + N times where N = number of cards exhausted this turn (during planning phase, before execution)
