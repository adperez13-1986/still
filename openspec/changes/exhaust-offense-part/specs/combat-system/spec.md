## ADDED Requirements

### Requirement: Slag Compressor part provides exhaust-scaling offense

The Slag Compressor behavioral part SHALL add bonus damage to the Arms slot based on the number of cards in the exhaust pile.

#### Scenario: Arms fires with Slag Compressor and exhausted cards
- **WHEN** the Arms slot fires during execution and the player has the Slag Compressor part and the exhaust pile contains N cards
- **THEN** the Arms action deals N additional damage (added to the base value before Amplify/Repeat modifiers apply)

#### Scenario: Arms fires with Slag Compressor and empty exhaust pile
- **WHEN** the Arms slot fires and the exhaust pile is empty
- **THEN** no bonus damage is added

#### Scenario: Slag Compressor does not apply to Override actions
- **WHEN** the Arms slot fires with an Override modifier
- **THEN** Slag Compressor bonus damage is NOT added (Override replaces the equipment action entirely)

### Requirement: Slag Compressor is an S1 uncommon part

#### Scenario: Slag Compressor appears in S1 part pool
- **WHEN** the S1 part drop pool is assembled
- **THEN** Slag Compressor SHALL be included as an uncommon rarity part
