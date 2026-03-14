## MODIFIED Requirements

### Requirement: Run state persists across page reloads
The active run SHALL be saved to localStorage at safe points and restored on page load.

#### Scenario: Save after room completion
- **WHEN** a map room is completed (combat won, shop left, event resolved, staging done)
- **THEN** the run state is saved to localStorage with combat nulled out

#### Scenario: Restore on page load
- **WHEN** the app loads and a saved run exists in localStorage
- **THEN** the run store is hydrated and the player is returned to the map screen

#### Scenario: Reload mid-combat
- **WHEN** the player reloads during combat
- **THEN** the run is restored to the map with the current room still uncleared (combat restarts)

#### Scenario: Clear on run end
- **WHEN** a run ends in victory or defeat
- **THEN** the saved run state is cleared from localStorage

#### Scenario: Corrupt or stale save
- **WHEN** a saved run fails to parse or hydrate
- **THEN** the save is silently cleared and the player starts from the workshop
