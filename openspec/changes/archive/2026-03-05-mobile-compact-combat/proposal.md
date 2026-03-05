## Why

Combat screen stacks ~1,200px of content vertically. On a ~667px mobile viewport, the player scrolls constantly between enemies (top) and Execute button (bottom). No responsive patterns exist in the codebase — all styles are inline React. The game is unplayable on mobile without a compact layout.

## What Changes

- Add a `useIsMobile()` hook (breakpoint <=600px) using `useSyncExternalStore`
- Each combat component gets a `compact?: boolean` prop for mobile rendering
- On mobile: StillPanel becomes a one-liner, EnemyCards become compact rows, BodySlotPanel switches to single-column, Hand cards become tappable chips, HeatTrack is hidden, Execute sticks to bottom
- Desktop layout is completely unchanged

## Capabilities

### Modified Capabilities
- `game-core`: Combat UI gains responsive mobile layout. No gameplay logic changes — only rendering.

## Impact

- `src/hooks/useIsMobile.ts` — New file: responsive breakpoint hook
- `src/components/StillPanel.tsx` — Add compact one-liner mode
- `src/components/EnemyCard.tsx` — Add compact row mode
- `src/components/BodySlotPanel.tsx` — Add single-column compact mode
- `src/components/Hand.tsx` — Add chip/pill compact mode
- `src/components/CombatScreen.tsx` — Wire useIsMobile, conditional layouts, sticky execute bar
