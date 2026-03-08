## Approach

Special-case DisableSlot in both intent display locations. Show the targetSlot name instead of the numeric value.

## Implementation

1. `IntentDisplay` (full/desktop): When intent.type is DisableSlot, render targetSlot name instead of value
2. Compact intent display: Same — show targetSlot instead of value
