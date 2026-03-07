# Workshop Carried Part Visibility

## Problem
The carried part section in the workshop only displayed when the part was broken (`durability === 0`) and had repairs remaining. Players with a functional carried part had no way to see it in the workshop.

## Solution
Always show the carried part section when a carried part exists:
- Functional: green border, name, description, durability counter
- Broken + repairable: orange border, [BROKEN] tag, repair button
- Broken + no repairs: orange border, [BROKEN] tag, no repair button

## Scope
- `src/components/WorkshopScreen.tsx` — removed conditional gate, added durability display for all states
