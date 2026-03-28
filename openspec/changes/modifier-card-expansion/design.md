## Context

10 cycling slot modifiers exist, 9 are generically good. Card picks are never meaningful. The game needs build-opinionated modifiers where taking the wrong card for your build is actively bad — creating real skip-or-take decisions.

Four archetypes: stat stacking, counter, exhaust, and berserker (new — pay HP/slots for power).

## Goals / Non-Goals

**Goals:**
- Add 14 new slot modifier cards that create meaningful draft decisions
- Each card should be great for 1-2 archetypes and bad/useless for others
- Introduce berserker as a 4th archetype via HP-cost and slot-sacrifice mechanics
- Use Still's unique slot system — cross-slot references, slot disabling, equipment-dependent scaling

**Non-Goals:**
- Not fixing Spread Shot or Cascade (separate effort)
- Not adding upgrade variants yet (base versions first)
- Not changing existing cards

## Decisions

### New effect types needed

Several cards require new `SlotModifierEffect` variants:

1. **`amplifyConditional`** — amplify that scales with game state (exhaust pile, slot values)
2. **`overrideExhaustHand`** — override that exhausts hand cards for damage
3. **`repeatScaling`** — repeat that scales with exhaust pile
4. **`amplifyWithSelfDamage`** — amplify with HP cost
5. **`overclockSlot`** — fires 3x, disables slot next turn
6. **`crossSlotBonus`** — adds another slot's equipment value as damage
7. **`combinedBlockRetaliate`** — block amplify + retaliate in one effect
8. **`blockHeal`** — block gained also heals percentage
9. **`volatileBlock`** — block that deals damage when broken

For Burnout (Power-type permanent): uses the system card pattern with `freePlay: false`, `Exhaust` keyword, and a new `SystemEffect` type `applyPermanent` that sets a per-combat flag.

For Shutdown (gain energy by disabling slot): uses system card pattern with `freePlay: true`, `Exhaust` keyword, and a new `SystemEffect` type `disableOwnSlot`.

### Card implementations

**BERSERKER (4 cards)**

| Card | Type | Cost | Slot | Effect | New type needed |
|------|------|------|------|--------|----------------|
| Reckless Boost | Slot/Amplify | 2E | Arms, Torso | +150%, take 5 damage | `amplifyWithSelfDamage` |
| Burnout | System/Power | 2E | Arms (home) | Permanent: -3 HP/turn, +2 Str/turn. Exhaust. | `applyPermanent: burnout` |
| Overclock Slot | Slot | 2E | Any | Slot fires 3x, disabled next turn | `overclockSlot` |
| Shutdown | System/freePlay | 0E | — | Disable one of your slots, gain 3E. Exhaust. | `disableOwnSlot` + `gainEnergy` |

**EXHAUST-ALIGNED (3 cards)**

| Card | Type | Cost | Slot | Effect | New type needed |
|------|------|------|------|--------|----------------|
| Scrap Charge | Slot/Amplify | 2E | Arms, Torso | +25% per card in exhaust pile | `amplifyConditional: exhaustPile` |
| Jettison | Slot/Override | 2E | Any | Exhaust up to 3 hand cards, deal 6 dmg each | `overrideExhaustHand` |
| Residual Charge | Slot/Repeat | 2E | Any | +1 extra firing per 3 cards in exhaust pile (max 3) | `repeatScaling: exhaustPile` |

**COUNTER-ALIGNED (4 cards)**

| Card | Type | Cost | Slot | Effect | New type needed |
|------|------|------|------|--------|----------------|
| Cross-Wire | Slot/Amplify | 2E | Arms | Bonus dmg = Torso equipment block value | `crossSlotBonus` |
| Iron Curtain | Slot | 3E | Torso | +200% block + Retaliate | `combinedBlockRetaliate` |
| Absorb | Slot | 2E | Torso | Block gained this turn also heals 50% | `blockHeal` |
| Volatile Armor | Slot | 2E | Torso | When block broken, deal broken amount to attacker | `volatileBlock` |

**STAT-ALIGNED (1 card)**

| Card | Type | Cost | Slot | Effect | New type needed |
|------|------|------|------|--------|----------------|
| Reinforce | Slot/Amplify | 2E | Torso | Dex bonus tripled | `amplifyStatMultiplier: dexterity` |

**BUILD-BRIDGE (3 cards)**

| Card | Type | Cost | Slot | Effect | New type needed |
|------|------|------|------|--------|----------------|
| Linked Fire | Slot | 2E | Arms | Arms fires with Legs' base value added as dmg | `crossSlotBonus: legs` |
| Redirect Power | Slot | 2E | Any | Fires twice, 2nd uses adjacent slot's action | `redirectPower` |
| Feedback Loop | Slot/Repeat | 2E | Any | +1 firing per card exhausted this turn | `repeatScaling: exhaustedThisTurn` |

### Pool assignment

All 14 cards go into `SECTOR2_CARD_POOL` (S2-weighted). They're stronger, more build-specific cards — appearing rarely in S1 as lucky finds, commonly in S2 as build-completion pieces.

Exception: Reckless Boost and Overclock Slot go into `SECTOR1_CARD_POOL` — berserker seeds should appear early like stat stacking seeds.

### Implementation approach

Rather than creating 14 new SlotModifierEffect types, simplify by reusing existing patterns where possible:

- Cards that need combat state access (exhaust pile, other slots) get resolved in `resolveBodyAction` or `executeBodyActions` via a new effect type that carries the condition
- Power-type (Burnout) uses combat state flags like `retaliateActive`
- Shutdown is a system card with `freePlay` that modifies combat state directly

## Risks / Trade-offs

- [14 cards at once is a lot] → Ship all at once for maximum variety impact. Balance via playtesting — number tuning is easy, mechanics are the hard part.
- [Many new effect types add complexity] → Each effect is isolated in the switch statement. No cross-effect interactions to worry about.
- [Berserker self-damage might be too punishing or too weak] → 5 damage per Reckless Boost and 3/turn for Burnout are starting values. Tunable.
