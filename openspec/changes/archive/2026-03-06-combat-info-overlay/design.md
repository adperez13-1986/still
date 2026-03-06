## Context

`RunInfoOverlay` is already used in `RunScreen.tsx` — triggered by "Deck" and "Equips" buttons. It accepts `tab`, `deck`, `parts`, `equipment`, `onClose`, `onTabChange` props. All this data is available in CombatScreen via the `run` store.

## Goals / Non-Goals

**Goals:**
- Let players view deck, equipment, and parts during combat

**Non-Goals:**
- Modifying RunInfoOverlay itself
- Adding new information to the overlay

## Decisions

### 1. Single "Info" button near the round counter

Place a small "Info" button in the execute/status bar area. Tapping opens RunInfoOverlay on the "equips" tab by default (most useful mid-combat). Player can switch tabs within the overlay.

On mobile, place it in the sticky bottom bar next to the round counter. On desktop, place it near the round number below the execute button.

### 2. Overlay available during planning phase only

The overlay is accessible during planning phase. During execution and enemy phases, it's not interactive anyway (animations playing). No need to restrict — the overlay is purely informational and doesn't pause anything.

## Risks / Trade-offs

None — purely additive, reusing existing component.
