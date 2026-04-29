# Combat System

## Purpose

Two-resource combat: per-turn **energy** budgets card plays; persistent **strain** tracks commitment across the run. Players assign modifier cards to four body slots (HEAD/TORSO/ARMS/LEGS), optionally pushing pushable cards for an alternate effect at an extra strain cost. Combat ends with **defeat** (HP 0), **victory** (all enemies down → reward phase), or **forfeit** (strain ≥ 20 → run continues, no rewards).

## Requirements

### Requirement: Combat resources

Combat uses two resources with different time scales:
- **Energy**: per-turn tactical budget. Resets to `maxEnergy` (default 8) at the start of each turn. Paid to play modifier cards.
- **Strain**: persistent accumulator. Starts at RunState.strain value. Accumulates during combat via push-card plays and specific enemy intents (StrainTick, StrainScale). Does not reset each turn. At 20, the player forfeits the current combat (no rewards, strain drops to 14). Carries between combats (with decay).

#### Scenario: Energy resets each turn
- **WHEN** a turn begins
- **THEN** `currentEnergy` is set to `maxEnergy`

#### Scenario: Strain persists across turns
- **WHEN** a turn ends
- **THEN** the `strain` value is unchanged (no reset)

#### Scenario: Forfeit at max strain
- **WHEN** combat's strain reaches or exceeds `maxStrain` (20)
- **THEN** combat phase transitions to `forfeit`, strain is set to 14, and the run continues without rewards for this fight

#### Scenario: Strain decay between combats
- **WHEN** a combat ends (any outcome)
- **THEN** strain decays by `STRAIN_DECAY_BETWEEN_COMBATS` (4) and carries to the next combat (floored at 0)

### Requirement: Body-slot combat phases

Combat proceeds through phases: planning (assign modifier cards to body slots, optionally push pushable cards), execution (body slot actions fire with modifiers applied), enemy turn, end of turn (status decrement, block reset, discard hand, draw new hand).

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player sees 4 body slots (HEAD/TORSO/ARMS/LEGS), current equipment in each slot, a hand of modifier cards, the strain meter, the energy budget, and enemy intents. Cards can be assigned to compatible slots by paying their energyCost. Pushable cards can toggle push mode (pay additional strain to use pushedEffect).

#### Scenario: Execution phase
- **WHEN** the player confirms execution
- **THEN** each body slot fires its equipment's base action modified by any assigned modifier card (including any pushedEffect if that card was pushed). Slot order: HEAD → TORSO → ARMS → LEGS. Part triggers (onSlotFire, onModifierPlay, etc.) resolve at their appropriate timing.

#### Scenario: Enemy turn
- **WHEN** player actions finish resolving
- **THEN** enemies execute intent patterns. All reactive intent types (Retaliate, StrainScale, Charge, ConditionalBuff, Leech, StrainTick, Enrage, BerserkerAttack, PhaseShift, etc.) work as before.

#### Scenario: End of turn
- **WHEN** the enemy turn completes
- **THEN** block resets (except persistent block), status effects decrement, hand is discarded (except Retain), draw pile reshuffles if empty, new hand drawn, energy refills, strain is unchanged, round increments.

### Requirement: Pushable cards

Certain modifier cards have a `pushCost` (additional strain cost) and `pushedEffect` (alternative effect). When playing a pushable card, the player can toggle push mode to pay the strain and apply the pushedEffect instead of the base effect.

#### Scenario: Pushable card baseline play
- **WHEN** the player plays a pushable card without push toggled on
- **THEN** the card costs only `energyCost`, applies its normal `category.effect`, and strain is not affected

#### Scenario: Pushable card pushed play
- **WHEN** the player plays a pushable card with push toggled on
- **THEN** the card costs `energyCost` energy + `pushCost` strain, applies `pushedEffect` instead of the base effect

#### Scenario: Insufficient strain budget for push
- **WHEN** the player tries to push a card that would exceed maxStrain
- **THEN** the push toggle is greyed out (cannot push)

### Requirement: Vent card

The starting deck contains a Vent card. When played, it ends the current turn (no more cards can be played), strain decreases by `VENT_STRAIN_RECOVERY` (5), and damage actions from body slots are skipped (defense actions still fire).

#### Scenario: Vent played
- **WHEN** the player plays Vent during the planning phase
- **THEN** strain decreases by 5, phase transitions to execution immediately, and during execution damage-type body actions (damage/debuff on enemies) are skipped. Block, heal, reduce, and draw actions still fire.

#### Scenario: Vent is always accessible
- **WHEN** Vent is in the player's hand
- **THEN** it costs 0 energy and has the Innate keyword (always drawn first turn)

### Requirement: Reactive enemies work unchanged

All enemy intent types (Attack, Block, Buff, Retaliate, StrainScale, CopyAction, Charge, ConditionalBuff, Leech, StrainTick, Enrage, ShieldAllies, BerserkerAttack, PhaseShift, StealBlock, MartyrHeal, DisableSlot, AttackDebuff, Scan) continue to function as currently implemented.

#### Scenario: StrainScale reads combat strain
- **WHEN** a StrainScale intent resolves
- **THEN** its damage scales with the combat's current strain value (floor(strain / divisor) bonus)

#### Scenario: StrainTick adds to combat strain
- **WHEN** a StrainTick intent resolves
- **THEN** combat's strain increases by the intent's value (capped at maxStrain)

### Requirement: HEAD debuff application limits

HEAD equipment that applies debuffs (Vulnerable, Weak) has stack caps to prevent runaway scaling with Repeat modifiers.

#### Scenario: Vulnerable stack cap from HEAD
- **WHEN** HEAD equipment applies Vulnerable to an enemy
- **THEN** the enemy's Vulnerable stacks cannot exceed 3 per combat from HEAD sources

#### Scenario: Repeat does not double-apply debuffs
- **WHEN** HEAD equipment fires with a Repeat modifier
- **THEN** the action's other effects (damage, block, etc.) apply per firing, but debuff stacks apply only once per turn regardless of Repeat firings
