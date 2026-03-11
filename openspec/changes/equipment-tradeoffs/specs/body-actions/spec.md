## ADDED Requirements

### Requirement: Equipment conditional-only firing
Equipment with `heatConditionOnly` SHALL only produce an action when Still is in the specified heat zone. Outside the zone, the slot fires but produces no effect and no heat.

#### Scenario: Conditional equipment fires in zone
- **WHEN** a slot with conditional-only equipment fires and Still is in the required zone
- **THEN** the action resolves normally with full effect

#### Scenario: Conditional equipment fires outside zone
- **WHEN** a slot with conditional-only equipment fires and Still is NOT in the required zone
- **THEN** the slot produces no action, no damage, no heat generation, and no modifier effects

### Requirement: Equipment multi-fire
Equipment with `multiFire` SHALL fire additional times when Still is in the specified heat zone. Each firing is a separate action that generates its own +1 execution heat and can be individually modified.

#### Scenario: Multi-fire equipment in zone
- **WHEN** a slot with multi-fire equipment fires and Still is in the required zone
- **THEN** the slot fires its base action, then fires again for each extra firing specified (e.g., 1 extra = 2 total firings)

#### Scenario: Multi-fire equipment outside zone
- **WHEN** a slot with multi-fire equipment fires and Still is NOT in the required zone
- **THEN** the slot fires once as normal

### Requirement: Equipment Block cost
Equipment with `blockCost` SHALL reduce Still's Block when the slot fires, representing a tradeoff against the TORSO domain.

#### Scenario: Block cost applied on fire
- **WHEN** a slot with Block-cost equipment fires during execution
- **THEN** Still loses the specified Block amount after the action resolves (Block cannot go below 0)

### Requirement: Equipment bonus foresight
Equipment with `bonusForesight` SHALL reveal additional enemy intents when the slot fires, alongside the primary action.

#### Scenario: Foresight bonus applied
- **WHEN** a slot with bonus foresight fires during execution
- **THEN** additional enemy intents are revealed equal to the foresight value, in addition to the primary action effect

## REMOVED Requirements

### Requirement: Shutdown disables all body actions
**Reason**: Shutdown mechanic was removed in the heat rework. Overheat now deals damage instead of causing shutdown.
**Migration**: Remove all shutdown references from body-actions spec. Overheat behavior is defined in the heat-system spec.

## MODIFIED Requirements

### Requirement: Body action output is affected by Heat thresholds
Body action output values are NOT modified by heat thresholds. The universal threshold bonus was removed in the heat rework. Equipment-specific bonuses (via heatBonusThreshold/heatBonusValue) still apply independently.

#### Scenario: No universal heat bonus
- **WHEN** a body action fires at any heat threshold
- **THEN** the action's output value is NOT modified by the heat zone — only equipment-specific bonuses apply

#### Scenario: Equipment-specific heat bonus still applies
- **WHEN** a body action fires from equipment with heatBonusThreshold and Still is at the matching threshold
- **THEN** the equipment's heatBonusValue is added to the action's output
