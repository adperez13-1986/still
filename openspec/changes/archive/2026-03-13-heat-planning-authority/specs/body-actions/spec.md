## MODIFIED Requirements

### Requirement: Body action output is affected by Heat thresholds
Body action output values SHALL be modified by the Heat threshold at the end of the planning phase. All slots use the same threshold — there is no per-slot threshold drift.

#### Scenario: Equipment heat bonus applies uniformly
- **WHEN** body actions fire during execution and equipment has a `heatBonusThreshold` condition
- **THEN** the bonus is evaluated against the planning-end heat, and the same result applies to all slots

#### Scenario: Heat-conditional-only equipment uses planning-end heat
- **WHEN** a slot has equipment with `heatConditionOnly` (e.g., Cryo Cannon fires only while Cool)
- **THEN** the condition is checked against planning-end heat — if met, the slot fires for all executions; if not, it is inactive for all executions

#### Scenario: Multi-fire equipment uses planning-end heat
- **WHEN** a slot has equipment with `multiFire` (e.g., Meltdown Cannon fires twice while Hot)
- **THEN** the multi-fire condition is checked against planning-end heat — if met, extra firings apply; if not, the slot fires once

#### Scenario: No per-slot heat accumulation during execution
- **WHEN** body actions fire sequentially (HEAD → TORSO → ARMS → LEGS)
- **THEN** heat does not increase between slot firings — each slot evaluates against the same heat value

### Requirement: Filled equipment slots generate automatic actions each turn
Each filled equipment slot SHALL produce one action per turn during the execution phase. The action is determined by the equipped item, not the slot itself. Empty slots produce no action. Slot firing no longer generates +1 heat.

#### Scenario: Filled slot generates action without heat
- **WHEN** the execution phase begins and an equipment slot has an item equipped
- **THEN** that slot's action fires with its base output value and heat does not change

#### Scenario: Empty slot generates nothing
- **WHEN** the execution phase begins and an equipment slot is empty
- **THEN** no action is generated for that slot

## REMOVED Requirements

### Requirement: Body action output is affected by Heat thresholds
**Reason**: Replaced by modified version above. The old requirement specified per-slot threshold checking with accumulating heat (+1 per slot) and universal Warm/Hot bonuses. Universal bonuses were already removed by heat-rework. Per-slot accumulation is now removed — all slots check against planning-end heat.
**Migration**: Equipment-specific `heatBonusThreshold` and `heatConditionOnly` still work, just evaluated once against planning-end heat instead of per-slot.

### Requirement: Shutdown disables all body actions
**Reason**: Shutdown was already removed by the heat-rework change (replaced by overheat damage model). This requirement was stale.
**Migration**: Overheat damage (3 per point over 9) replaces shutdown.
