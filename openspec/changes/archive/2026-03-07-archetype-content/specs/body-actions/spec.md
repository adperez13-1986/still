## ADDED Requirements

### Requirement: Equipment items can have heat-conditional effects
Some equipment items SHALL have bonus effects that activate based on Still's heat threshold at the moment of execution.

#### Scenario: Equipment bonus at matching threshold
- **WHEN** a body action fires from equipment with a heat-conditional bonus and Still is at the required threshold
- **THEN** the enhanced effect applies (e.g., extra draw, extra Block)

#### Scenario: Equipment bonus outside threshold
- **WHEN** a body action fires from equipment with a heat-conditional bonus and Still is below the required threshold
- **THEN** only the base effect applies

### Requirement: Each equipment slot has at least three options in Act 1
The Act 1 equipment pool SHALL include at least 3 items per slot, providing meaningful choice within each body domain.

#### Scenario: Third Head equipment option
- **WHEN** Head equipment drops in Act 1
- **THEN** the pool includes Calibrated Optics (draw 1 card, draw 2 while Cool) alongside Basic Scanner and Cracked Lens

#### Scenario: Third Torso equipment option
- **WHEN** Torso equipment drops in Act 1
- **THEN** the pool includes Thermal Plating (gain 3 Block, gain 5 while Hot) alongside Scrap Plating and Patched Hull

#### Scenario: Third Arms equipment option
- **WHEN** Arms equipment drops in Act 1
- **THEN** the pool includes Overclocked Pistons (deal 8 damage, generates +1 Heat) alongside Piston Arm and Welding Torch

#### Scenario: Third Legs equipment option
- **WHEN** Legs equipment drops in Act 1
- **THEN** the pool includes Adaptive Treads (lose 2 Heat, gain 1 Block per heat lost) alongside Worn Actuators and Salvaged Treads
