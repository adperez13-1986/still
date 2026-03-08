## Why

DisableSlot enemy intents display as "lock 0" — showing an irrelevant value and hiding which slot will be locked. Players can't anticipate or plan around slot disabling.

## What Changes

- Show the target slot name instead of the value for DisableSlot intents (e.g. "lock Head")
- Apply to both compact (mobile) and full (desktop) intent displays in EnemyCard

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — display-only fix)

## Impact

- `src/components/EnemyCard.tsx` — IntentDisplay and compact intent rendering
