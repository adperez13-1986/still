## REMOVED Requirements

### Requirement: Body action output is not affected by Heat thresholds
**Reason**: Heat thresholds no longer exist. This requirement was about ensuring no universal bonus from zones — with zones gone, the requirement is moot.
**Migration**: Remove all threshold-checking logic from body action execution.

### Requirement: Equipment items can have heat-conditional effects
**Reason**: Heat zones removed. Equipment bonuses gated by Cool/Warm/Hot no longer function.
**Migration**: Equipment with heatBonusThreshold, heatCondition, or heatConditionOnly are reworked to unconditional effects at balanced values, or gain new non-heat conditions.

### Requirement: Body actions always fire regardless of heat
**Reason**: With energy budget (not accumulative heat), there is no overheat or shutdown scenario. Body actions always fire because there's no mechanism that would prevent them.
**Migration**: Remove overheat checks from execution phase. Body actions always fire (unchanged behavior, just simpler code path).

## MODIFIED Requirements

### Requirement: Equipment slots have fixed domains
Each of the four equipment slots SHALL govern a specific combat domain, and equipment items SHALL only fit in their designated slot.

#### Scenario: HEAD slot governs information
- **WHEN** a HEAD item is equipped
- **THEN** its action relates to information — card draw, enemy intent foresight, or reactive scanning

#### Scenario: TORSO slot governs durability
- **WHEN** a TORSO item is equipped
- **THEN** its action relates to durability — gaining Block, healing, or damage reduction

#### Scenario: ARMS slot governs output
- **WHEN** an ARMS item is equipped
- **THEN** its action relates to output — dealing damage to enemies or applying debuffs

#### Scenario: LEGS slot governs flow
- **WHEN** a LEGS item is equipped
- **THEN** its action relates to flow — card draw, card cycling, deck manipulation, or Block gain

### Requirement: Each equipment slot has at least three options in Sector 1
The Sector 1 equipment pool SHALL include at least 3 items per slot, providing meaningful choice within each body domain.

#### Scenario: LEGS equipment options in Sector 1
- **WHEN** LEGS equipment drops in Sector 1
- **THEN** the pool includes utility-focused options (card draw, cycling, or Block) rather than cooling effects
