## MODIFIED Requirements

### Requirement: Body action output is NOT affected by Heat thresholds
Body action output values SHALL NOT receive any universal bonus from heat thresholds. The previous +1 (Warm) and +2 (Hot) bonuses are removed. Equipment-specific heat-conditional bonuses (e.g., Heat Shield's +4 Block while Hot) continue to function — those are per-item effects, not universal.

#### Scenario: No bonus at Warm
- **WHEN** a body action fires while Heat is in the Warm range (4-6)
- **THEN** the action's output value is its base value with no threshold bonus

#### Scenario: No bonus at Hot
- **WHEN** a body action fires while Heat is in the Hot range (7-9)
- **THEN** the action's output value is its base value with no threshold bonus

#### Scenario: No bonus at Cool
- **WHEN** a body action fires while Heat is in the Cool range (0-3)
- **THEN** the action's output value is its base value with no threshold bonus

#### Scenario: Equipment-specific bonuses still apply
- **WHEN** a body action fires from equipment with a heat-conditional bonus (e.g., heatBonusThreshold: Hot, heatBonusValue: 4) and Still is at the matching threshold
- **THEN** the equipment's specific bonus applies to the action output

### Requirement: Shutdown does not disable body actions
Overheat no longer triggers shutdown. Body actions SHALL always fire during the execution phase regardless of heat level.

#### Scenario: Body actions fire at Overheat heat levels
- **WHEN** the execution phase begins and Still's heat is 12
- **THEN** all filled equipment slots fire in order (HEAD, TORSO, ARMS, LEGS), each generating +1 heat and triggering overheat damage per the overheat-damage spec

#### Scenario: No shutdown turn exists
- **WHEN** Still's heat exceeded 9 on the previous turn
- **THEN** the next turn proceeds normally — body actions fire, all cards may be played, no actions are skipped

## REMOVED Requirements

### Requirement: Shutdown disables all body actions
**Reason**: Shutdown mechanic is fully removed. Overheat now deals damage instead of causing shutdown. Players always get to take their turn.
**Migration**: Remove shutdown flag checks from execution phase. Remove shutdown turn logic. Remove system-cards-only restriction.
