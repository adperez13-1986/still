## ADDED Requirements

### Requirement: Energy budget resets each turn
Combat SHALL track a per-turn energy budget (called "Heat" in the UI). At the start of each turn, available energy resets to the maximum budget value. Playing cards spends energy. Unspent energy does not carry over.

#### Scenario: Energy resets at turn start
- **WHEN** a new turn begins
- **THEN** Still's available energy is set to the maximum budget (default: 8)

#### Scenario: Playing a card spends energy
- **WHEN** the player plays a modifier card with an energy cost of N
- **THEN** available energy decreases by N

#### Scenario: Cannot play card without sufficient energy
- **WHEN** the player attempts to play a card with energy cost N and available energy is less than N
- **THEN** the card cannot be played

#### Scenario: Unspent energy does not carry over
- **WHEN** the turn ends with remaining energy
- **THEN** the remaining energy is lost; next turn starts at full budget

### Requirement: Default energy budget is 8
The base energy budget per turn SHALL be 8. This can be modified by parts or equipment effects.

#### Scenario: Base budget
- **WHEN** a combat encounter begins with no budget-modifying parts
- **THEN** the energy budget is 8 per turn

#### Scenario: Part modifies budget
- **WHEN** Still has a part that grants +2 energy budget
- **THEN** the energy budget is 10 per turn

### Requirement: Energy display shows spent and available
The combat UI SHALL display the current energy state as available/maximum (e.g., "5/8") updated in real-time as cards are played during the planning phase.

#### Scenario: Display updates on card play
- **WHEN** the player plays a card costing 2 energy from a budget of 8
- **THEN** the display shows "6/8"

#### Scenario: Display updates on card unassign
- **WHEN** the player unassigns a modifier card (returning it to hand)
- **THEN** the energy cost is refunded and the display updates accordingly

### Requirement: Energy budget is the sole constraint on card plays per turn
Cards SHALL be constrained only by energy budget and slot availability. There is no separate heat accumulation, threshold system, or overheat penalty.

#### Scenario: Play cards up to budget
- **WHEN** the player has 8 energy and plays four 2-cost cards
- **THEN** all four cards are played, energy is 0, no penalties apply

#### Scenario: No penalty for spending all energy
- **WHEN** the player spends all available energy in a turn
- **THEN** no damage, debuff, or negative effect occurs from being at 0 energy
