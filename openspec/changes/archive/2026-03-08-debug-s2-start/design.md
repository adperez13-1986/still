## Approach

Check `URLSearchParams` for `debug=s2` in RunScreen's initialization effect. If present, bypass normal init and start a Sector 2 run with a pre-built loadout: starter cards + some S2 cards, equipment in all 4 slots, a behavioral part, and boosted health.

## Implementation

1. Parse `location.search` for `debug=s2`
2. Build a S2 debug loadout with mixed S1/S2 cards, full equipment, a part
3. Call `startRun` with sector 2 and the debug loadout
