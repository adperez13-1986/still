## ADDED Requirements

### Requirement: Compendium accessible from Workshop
The Workshop screen SHALL include a button to navigate to the Compendium screen. The Compendium SHALL display a back button to return to the Workshop.

#### Scenario: Opening the Compendium
- **WHEN** the player taps the Compendium button in the Workshop
- **THEN** the Compendium screen is displayed with the Cards tab active by default

#### Scenario: Returning to Workshop
- **WHEN** the player taps the back button in the Compendium
- **THEN** the player returns to the Workshop screen

### Requirement: Compendium has four browsable tabs
The Compendium SHALL display four tabs: Cards, Equipment, Mods, and Bestiary. Tapping a tab SHALL switch the displayed content.

#### Scenario: Switching tabs
- **WHEN** the player taps a tab header
- **THEN** the content area updates to show entries for that category

### Requirement: Cards tab displays all modifier cards with upgrade toggle
The Cards tab SHALL list all modifier card definitions. Each entry shows the card name, description, heat cost, category, and keywords. Each entry SHALL have a toggle to view the upgraded variant.

#### Scenario: Viewing a card entry
- **WHEN** the Cards tab is active
- **THEN** all modifier cards are listed with their base stats

#### Scenario: Toggling upgraded variant
- **WHEN** the player activates the upgrade toggle on a card entry
- **THEN** the entry displays the upgraded card's name, description, heat cost, and effects

### Requirement: Equipment tab displays all equipment grouped by slot
The Equipment tab SHALL list all equipment definitions grouped under slot headers (Head, Torso, Arms, Legs). Each entry shows the equipment name, description, slot, action summary, and rarity.

#### Scenario: Viewing equipment by slot
- **WHEN** the Equipment tab is active
- **THEN** equipment entries are displayed under their respective slot group headers

### Requirement: Mods tab displays all behavioral mods
The Mods tab SHALL list all behavioral mod definitions. Each entry shows the mod name, description, trigger, effect, and rarity.

#### Scenario: Viewing mod entries
- **WHEN** the Mods tab is active
- **THEN** all behavioral mods are listed with their trigger and effect descriptions

### Requirement: Bestiary tab displays all enemies grouped by tier
The Bestiary tab SHALL list all enemy definitions grouped by tier: Standard, Elite, Boss. Each entry shows the enemy name, max health, intent pattern, and drop pool summary.

#### Scenario: Viewing enemies by tier
- **WHEN** the Bestiary tab is active
- **THEN** enemies are displayed under their respective tier headers (Standard, Elite, Boss)

#### Scenario: Boss entry includes flavor text
- **WHEN** a boss enemy has flavor text defined
- **THEN** the bestiary entry SHALL display the flavor text
