## ADDED Requirements

### Requirement: Link synergy activation

When both actions in a linked pair are pushed, a synergy effect SHALL activate based on the type combination of the two actions.

#### Scenario: Known synergy pair
- **WHEN** both actions in a pair are pushed AND their type combination has a defined synergy
- **THEN** the synergy effect activates in addition to both actions firing normally

#### Scenario: Unknown combination
- **WHEN** both actions in a pair are pushed AND their type combination has no defined synergy
- **THEN** both actions fire normally with no bonus effect. Link tax still applies.

#### Scenario: Link dormant
- **WHEN** only one action in a pair is pushed
- **THEN** no synergy activates. Only the pushed action fires at pushed value.

### Requirement: Type-based synergy table

Synergies SHALL be determined by the TYPE combination of the paired actions, not specific action IDs.

#### Scenario: damage_single + block = Counter
- **WHEN** a damage_single action and a block action are linked and both pushed
- **THEN** Counter activates: if block absorbs an entire enemy attack this turn, the damage action fires again at base value

#### Scenario: damage_single + heal = Drain
- **WHEN** a damage_single action and a heal action are linked and both pushed
- **THEN** Drain activates: the damage action heals the player for 30% of damage dealt

#### Scenario: damage_single + damage_all = Cleave
- **WHEN** a damage_single and damage_all action are linked and both pushed
- **THEN** Cleave activates: the single-target hit also deals 50% to all other enemies

#### Scenario: damage_single + damage_single = Focus
- **WHEN** two damage_single actions are linked and both pushed
- **THEN** Focus activates: both damage values combine into one hit on the selected target

#### Scenario: damage_single + reduce = Thorns
- **WHEN** a damage_single and reduce action are linked and both pushed
- **THEN** Thorns activates: damage reduction also deals 2 back to each attacker per hit

#### Scenario: damage_single + buff = Empower
- **WHEN** a damage_single and buff action are linked and both pushed
- **THEN** Empower activates: buff value is doubled on the damage action

#### Scenario: damage_single + debuff = Exploit
- **WHEN** a damage_single and debuff action are linked and both pushed
- **THEN** Exploit activates: damage action deals +50% to debuffed enemies

#### Scenario: block + heal = Fortify
- **WHEN** a block and heal action are linked and both pushed
- **THEN** Fortify activates: excess block (block beyond damage taken) converts to healing

#### Scenario: block + reduce = Bastion
- **WHEN** a block and reduce action are linked and both pushed
- **THEN** Bastion activates: block and damage reduction both apply (stacked mitigation)

#### Scenario: block + buff = Bolster
- **WHEN** a block and buff action are linked and both pushed
- **THEN** Bolster activates: block value doubled this turn

#### Scenario: block + convert = Recycle
- **WHEN** a block and convert action are linked and both pushed
- **THEN** Recycle activates: remaining block at end of turn converts to strain reduction (2 block = 1 strain)

#### Scenario: damage_all + debuff = Suppress
- **WHEN** a damage_all and debuff action are linked and both pushed
- **THEN** Suppress activates: AoE also applies the debuff to all enemies hit

#### Scenario: damage_all + damage_all = Barrage
- **WHEN** two damage_all actions are linked and both pushed
- **THEN** Barrage activates: total hits doubled across all enemies

#### Scenario: heal + buff = Regenerate
- **WHEN** a heal and buff action are linked and both pushed
- **THEN** Regenerate activates: heal applies half now, half next turn

#### Scenario: heal + convert = Transfuse
- **WHEN** a heal and convert action are linked and both pushed
- **THEN** Transfuse activates: healing also reduces strain by 2

#### Scenario: recovery + any = Second Wind
- **WHEN** Vent is in a pair and is active (toggled on)
- **THEN** Second Wind activates: linked action gains +3 base value next turn

#### Scenario: reflect + damage_single = Mirror Strike
- **WHEN** a reflect and damage_single action are linked and both pushed
- **THEN** Mirror Strike activates: reflected damage is amplified by 50%

#### Scenario: utility + damage_single = Focused Aggro
- **WHEN** a utility (taunt) and damage_single action are linked and both pushed
- **THEN** Focused Aggro activates: counter-attack on every hit received this turn
