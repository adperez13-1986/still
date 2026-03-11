## Context

Yanah and Yuri are companion modifier cards unlocked via the Workshop and auto-added to the starting deck. Currently:
- Yanah: 0 heat, System (Cooling) — heals 6 HP + removes 1 debuff
- Yuri: +1 heat, System (Conditional) — gains 1 Strength + 1 Inspired

Both are generic stat bumps with no heat-archetype identity. Yanah is especially strong in thin decks where she cycles every turn for free block/healing. The event system already exists (`EventVignette` in `narrative.ts`, rendered by `EventScreen.tsx`) but only supports outcomes: health, shards, card, status, removeCard.

## Goals / Non-Goals

**Goals:**
- Companion cards become event-gated mid-run acquisitions, not starting deck auto-includes
- Redesigned effects align with heat archetypes (Yanah = Cool Runner, Yuri = Pyromaniac)
- Workshop unlock gates event availability (event only appears if companion is unlocked)
- Events carry emotional weight — these represent the developer's children
- New `companion` outcome type in the event system

**Non-Goals:**
- Full meaningful events system overhaul (that's a separate roadmap item)
- Companion card upgrades redesign (keep existing upgrade structure, just change base/upgraded effects)
- Changes to event UI layout or styling beyond what's needed for companion events

## Decisions

### 1. New outcome type `companion` for events

Add `'companion'` to the `EventChoice.outcome.type` union. The `value` field will hold the companion card ID string (not a number). When resolved in `runStore.ts`, this creates a card instance and adds it to the player's deck mid-run.

**Why**: Cleaner than overloading `card` type, and we may want companion-specific handling (e.g., only one of each companion per run).

### 2. Companion events are sector-agnostic, gated by Workshop unlock

Companion events live in a separate pool (not `SECTOR1_EVENTS` / `SECTOR2_EVENTS`). When resolving an event room, check if any unlocked companions haven't been acquired this run. If so, chance to trigger a companion event instead of a regular one.

**Why**: Companions shouldn't be sector-locked. A player could find Yanah in Sector 1 or Sector 2. The Workshop unlock is the gate, not sector progression.

### 3. Card effect redesign with heatBonus pattern

Use the existing `heatBonus` field on `ModifierCardDefinition` for the threshold-conditional effects:
- **Yanah**: System card, 0 heat. Base: gain 4 Block. heatBonus at Cool: gain 8 Block instead.
- **Yuri**: System card, 1 heat. Base: deal 8 damage to one enemy. heatBonus at Hot: deal 14 instead.

**Why**: Uses existing card infrastructure. The `heatBonus` pattern is already supported by the combat engine.

### 4. Accept/Decline only — no exploitative third option

Each companion event has exactly two choices: accept (companion joins deck + small bonus) or decline (lesser reward, warm farewell). No "sacrifice for power" option.

**Why**: These are the developer's children. The events should feel warm, not transactional.

### 5. Decline reward is healing, not shards

Declining gives health recovery — "the peace of knowing they're safe" — not a currency reward.

**Why**: Shards feel transactional. Health feels like emotional relief.

## Risks / Trade-offs

- **[Thin deck concern persists]** → Yanah at 0 heat with 8 Block while Cool is still strong in thin decks. Mitigated: she's no longer auto-included, player must find her event AND be building Cool. The opportunity cost is real.
- **[Event frequency]** → If companion events are too rare, unlocking feels bad. If too common, they feel forced. → Start with 30% chance per event room when a companion is available. Tunable.
- **[Mid-run deck addition UX]** → Player needs to understand a card was added to their deck. → The event outcome description handles this ("Yanah joins your journey. Card added to deck.").
