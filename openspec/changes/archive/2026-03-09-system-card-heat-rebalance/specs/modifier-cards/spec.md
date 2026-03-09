## ADDED Requirements

### Requirement: Cool payoff cards cost heat
System cards that provide bonuses while Cool SHALL have a positive heat cost (minimum 1). This ensures the Cool archetype requires cooling infrastructure investment to sustain, rather than being free to spam indefinitely.

#### Scenario: Precision Strike heat cost
- **WHEN** the player plays Precision Strike
- **THEN** 1 heat is added to Still's heat gauge

#### Scenario: Cold Efficiency heat cost
- **WHEN** the player plays Cold Efficiency
- **THEN** 1 heat is added to Still's heat gauge

#### Scenario: Glacier Lance heat cost
- **WHEN** the player plays Glacier Lance
- **THEN** 1 heat is added to Still's heat gauge

### Requirement: Failsafe Protocol costs heat
Failsafe Protocol SHALL cost 1 heat. At 0 heat, 10 Block + Draw 1 is generically too strong with no opportunity cost.

#### Scenario: Failsafe Protocol heat cost
- **WHEN** the player plays Failsafe Protocol
- **THEN** 1 heat is added to Still's heat gauge
