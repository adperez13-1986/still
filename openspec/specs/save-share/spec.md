### Requirement: Export save as share code
The system SHALL encode the player's permanent state into a compact, URL-safe string (share code) that can be copied to clipboard.

#### Scenario: Player exports save
- **WHEN** the player taps "Export Save" in the Workshop
- **THEN** the system encodes the current `PermanentState` into a share code, copies it to the clipboard, and displays brief confirmation feedback

#### Scenario: Share code format
- **WHEN** the system generates a share code
- **THEN** the code SHALL be prefixed with a version identifier (`v1:`) followed by base64url-encoded compressed JSON

### Requirement: Import save from share code
The system SHALL accept a share code string, decode it, validate it, and restore the player's permanent state from it.

#### Scenario: Player imports a valid code
- **WHEN** the player pastes a valid share code and confirms the import
- **THEN** the system decodes the code, replaces the current `PermanentState` entirely, persists it, and refreshes the UI to reflect the imported state

#### Scenario: Player imports an invalid code
- **WHEN** the player pastes a malformed or corrupted share code and confirms
- **THEN** the system SHALL display an error message and leave the current state unchanged

#### Scenario: Import requires confirmation
- **WHEN** the player initiates an import
- **THEN** the system SHALL warn that importing will overwrite current progress and require explicit confirmation before applying

### Requirement: Forward compatibility
Share codes SHALL include a version prefix so future format changes can be detected and handled gracefully.

#### Scenario: Unknown version code imported
- **WHEN** a share code with an unrecognized version prefix is imported
- **THEN** the system SHALL display an error indicating the code format is not supported

#### Scenario: Missing fields in imported state
- **WHEN** a valid share code is decoded but the state is missing fields (from an older version)
- **THEN** the system SHALL fill missing fields with default values and import successfully
