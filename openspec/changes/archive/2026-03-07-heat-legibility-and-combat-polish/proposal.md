# Heat Legibility & Combat Polish

## Problem
The heat system is a core differentiator but hard to reason about during combat:
- Players can't predict what heat they'll be at when each body slot fires
- The heat threshold bonus (+0/+1/+2) silently modifies damage/block/heal with no UI indication
- The projected heat on the heat track was wrong — it ignored part-triggered extra firings
- No visibility into next-round heat after passive cooling
- On mobile, no heat projection at all (HeatTrack is hidden)

Secondary issues discovered during session:
- Target doesn't auto-switch when the targeted enemy dies
- Shard count not visible on the map, making shop decisions blind
- TypeScript build still failing from incomplete Uint8Array cast fix

## Solution
1. **Per-slot threshold badges** — show `@Cool`/`@Warm`/`@Hot` on each body slot
2. **Value breakdowns** — show `5+2 dmg` with heat contribution in orange
3. **Fix projected heat** — derive from `projectSlotActions` instead of incomplete `projectHeat`
4. **Next-round heat preview** — show post-cooling heat on heat track and mobile compact view
5. **Auto-switch target** — fall through to next alive enemy when target dies
6. **Shards on map** — display shard count in floating info bar
7. **Fix TS build** — cast `Uint8Array` through `unknown` to `BufferSource`

## Scope
- `src/game/combat.ts` — extended `SlotProjection`, dual-resolve for heat contribution
- `src/components/BodySlotPanel.tsx` — `ThresholdBadge` and `HeatValueDisplay` components
- `src/components/HeatTrack.tsx` — next-round heat display
- `src/components/StillPanel.tsx` — mobile heat projection chain
- `src/components/CombatScreen.tsx` — derived projected heat, target auto-switch
- `src/components/RunScreen.tsx` — shard count on map
- `src/game/persistence.ts` — TypeScript build fix
