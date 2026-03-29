## ADDED Requirements

### Requirement: HEAD debuff action type

HEAD equipment SHALL fire a `debuff` action that applies status effect stacks to enemies.

#### Scenario: HEAD fires debuff action
- **WHEN** the HEAD slot fires during execution with debuff equipment
- **THEN** the specified debuff (Vulnerable or Weak) is applied to the target enemy with the specified number of stacks

#### Scenario: HEAD debuff with Amplify
- **WHEN** HEAD has a debuff action with baseValue N and an Amplify modifier with multiplier M
- **THEN** the debuff stacks applied are floor(N * M)

#### Scenario: HEAD debuff with Repeat
- **WHEN** HEAD has a debuff action and a Repeat modifier
- **THEN** the debuff is applied once per firing (stacks accumulate)

### Requirement: LEGS damage reduction action type

LEGS equipment SHALL fire a `reduce` action that sets per-hit damage reduction for the turn.

#### Scenario: LEGS fires reduce action
- **WHEN** the LEGS slot fires during execution with reduce equipment
- **THEN** a damage reduction value is set for the turn, applied to each enemy hit

#### Scenario: Damage reduction applied per hit
- **WHEN** an enemy attacks and damage reduction is active
- **THEN** each hit is reduced by the reduction value (minimum 0 damage per hit) BEFORE block absorption

#### Scenario: LEGS reduce with Amplify
- **WHEN** LEGS has a reduce action with baseValue N and an Amplify modifier
- **THEN** the reduction value is floor(N * multiplier)

#### Scenario: LEGS reduce with Repeat
- **WHEN** LEGS has a reduce action and a Repeat modifier
- **THEN** the reduction fires multiple times, adding baseValue each time (stacking reduction)

## REMOVED Requirements

### Requirement: Draw as equipment action type
**Reason**: HEAD no longer provides draw. Draw is base only (5 per turn). LEGS no longer provides draw.
**Migration**: All HEAD and LEGS equipment reworked to debuff and reduce action types respectively. Base draw increased to 5.

### Requirement: Foresight as equipment property
**Reason**: Foresight was tied to HEAD equipment which is being reworked.
**Migration**: Foresight removed from equipment. May be reintroduced as a part effect in a future change.
