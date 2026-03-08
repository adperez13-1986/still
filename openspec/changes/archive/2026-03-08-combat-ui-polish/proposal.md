## Why

Several small combat UI improvements: the target name next to Execute was redundant (TGT badge + yellow border suffice), the mobile sector/round label was too abbreviated, and there's no way to see equipment details during combat without opening the full Info overlay.

## What Changes

- Remove target enemy name label from both mobile and desktop execute bars (already done)
- Use full "Sector N · Round N" text in mobile bottom bar (already done)
- Add long-press info popup on body slot equipment panels showing equipment name, description, and stats

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — UI polish, no spec-level changes)

## Impact

- `src/components/CombatScreen.tsx` — target label removal, sector/round text
- `src/components/BodySlotPanel.tsx` — long-press popup for equipped items
