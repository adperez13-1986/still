## Why

The Pyromaniac archetype is unplayable. Hot (8-9) is a 2-point window where the second slot firing triggers Overheat shutdown. Even with Pressure Valve, Hot is a fragile state that can't sustain a real build identity. Meanwhile, Cool (0-4) is generous and easy to maintain, and the universal threshold bonus (+1 Warm, +2 Hot) makes "drift hot for free stats" the dominant strategy rather than a deliberate build choice.

The heat system needs reworked thresholds, a new overheat mechanic, and removal of the universal threshold bonus so that heat zones become meaningful build commitments rather than passive stat modifiers.

## What Changes

- **BREAKING** — Heat thresholds shift: Cool 0-3 (was 0-4), Warm 4-6 (was 5-7), Hot 7-9 (was 8-9)
- **BREAKING** — Overheat rework: heat can exceed 9 during a turn. No shutdown. Instead, any heat increase while over 9 deals 3 damage per point over 9 instantly. LEGS cooling can bring heat back down. Natural death spiral replaces binary shutdown.
- **BREAKING** — Remove universal threshold bonus (+1 at Warm, +2 at Hot). All archetype power comes from equipment and parts, not passive zone bonuses.
- Hot self-damage (3 HP/turn) stays as the cost of being in the Hot zone.
- Heat projection UI must update warnings for new thresholds and overheat damage model.
- All heat-conditional effects on cards, parts, and equipment must be re-audited for new threshold values.

## Capabilities

### New Capabilities

- `overheat-damage`: The damage-per-point overheat model — any heat increase while over 9 deals 3 damage per point over 9. Replaces binary shutdown.

### Modified Capabilities

- `heat-system`: Threshold boundaries change (Cool 0-3, Warm 4-6, Hot 7-9). Overheat no longer triggers shutdown. Remove universal threshold bonus.
- `body-actions`: Remove heat threshold output bonus (+1 Warm, +2 Hot) from body action resolution. Body actions still generate +1 heat each. Overheat check during execution changes from per-slot shutdown to per-slot damage.

## Impact

- `src/game/types.ts` — Heat threshold constants and `getHeatThreshold()` function
- `src/game/combat.ts` — Slot execution overheat checking, `resolveBodyAction` threshold bonus removal, `projectSlotActions` heat projection
- `src/data/parts.ts` — Parts referencing heat thresholds (Pressure Valve, Reactive Frame, etc.) need re-audit
- `src/data/cards.ts` — Cards with heat-conditional effects need re-audit for new threshold values
- `src/components/CombatScreen.tsx` — Heat projection UI warnings
- `src/components/BodySlotPanel.tsx` — Projected heat display and threshold indicators
