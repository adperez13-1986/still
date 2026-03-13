## ADDED Requirements

### Requirement: While Hot, incoming damage reduces Heat instead of HP
When Still is in the Hot zone (heat 7+), incoming damage SHALL be partially absorbed by reducing Heat at a 1:2 ratio (1 heat point absorbed per 2 damage). Heat can drain down to the Warm floor (heat 4) through ablation. Any damage remaining after heat is drained to 4 applies to HP normally.

#### Scenario: Full absorption at high heat
- **WHEN** Still has heat 9 and takes 8 damage (after block)
- **THEN** 4 heat is absorbed (8 / 2 = 4), heat drops from 9 to 5 (Warm), 0 HP damage taken

#### Scenario: Partial absorption — drain to Warm floor
- **WHEN** Still has heat 9 and takes 18 damage (after block)
- **THEN** 5 heat is absorbed (9 down to 4 = 5 heat × 2 = 10 damage absorbed), 8 HP damage taken, heat is 4 (Warm)

#### Scenario: Minimal absorption at Hot floor
- **WHEN** Still has heat 7 and takes 12 damage (after block)
- **THEN** 3 heat is absorbed (7 down to 4 = 3 heat × 2 = 6 damage absorbed), 6 HP damage taken, heat is 4 (Warm)

#### Scenario: Absorption from overheat territory
- **WHEN** Still has heat 12 and takes 18 damage (after block)
- **THEN** 8 heat is absorbed (12 down to 4 = 8 heat × 2 = 16 damage absorbed), 2 HP damage taken, heat is 4 (Warm)

#### Scenario: Small hit fully absorbed
- **WHEN** Still has heat 8 and takes 4 damage (after block)
- **THEN** 2 heat is absorbed (4 / 2 = 2), heat drops from 8 to 6 (Warm), 0 HP damage taken

#### Scenario: Not active at Warm or Cool
- **WHEN** Still has heat 5 (Warm) and takes 10 damage
- **THEN** all 10 damage applies to HP, heat unchanged — ablative heat only activates at Hot (7+)

#### Scenario: Block is applied before ablative heat
- **WHEN** Still has 6 block and heat 9, and takes 16 damage
- **THEN** block absorbs 6 (16 - 6 = 10 remaining), then ablative absorbs 5 heat (10 / 2 = 5, but max drain is 9 - 4 = 5, so 5 × 2 = 10 absorbed), 0 HP damage taken, heat is 4 (Warm), block is 0

#### Scenario: Odd damage rounds down heat absorbed
- **WHEN** Still has heat 9 and takes 7 damage (after block)
- **THEN** 3 heat is absorbed (floor(7 / 2) = 3), heat drops from 9 to 6 (Warm), 1 HP damage taken (7 - 3×2 = 1)

### Requirement: Ablative heat is systemic
Ablative heat SHALL be built into the heat system itself and apply automatically whenever Still is in the Hot zone (7+). It does not require a specific part, equipment, or card to activate.

#### Scenario: No setup required
- **WHEN** Still enters Hot zone through any means (card heat costs, equipment effects)
- **THEN** ablative heat protection is immediately active for any incoming damage
