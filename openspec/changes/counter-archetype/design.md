## Context

The prototype is already implemented from sim testing. Retaliate, Fortify, and Thorns Core are in the codebase and the combat sim confirms they work. This change formalizes the prototype.

The Counter build identity: "my Torso is my primary damage source, Arms is supplementary." The stat stacker invests in Arms + Strength. The Counter player invests in Torso + block + Retaliate.

## Goals / Non-Goals

**Goals:**
- Retaliate card creates a viable Torso-centered damage strategy
- Thorns Core provides passive counter damage that rewards taking hits
- Fortify bridges defense and offense in a single card
- The build is viable but not dominant — target ~85-90% overall win rate (comparable to stat stacking, not better)

**Non-Goals:**
- Making Counter and stat stacking mutually exclusive (a smart player can splash both — that's fine)
- Rebalancing S2 encounters (separate change)
- Adding more Counter pieces (this is the minimum viable archetype — 3 pieces)

## Decisions

### 1. Retaliate as a primary slot modifier on Torso

Retaliate occupies the primary modifier slot on Torso, competing with Amplify. A player can't Amplify Torso AND Retaliate in the same turn (unless they have Dual Loader). This creates per-turn tension: multiply block output (Amplify) or convert it to counter damage (Retaliate)?

Retaliate goes on primary, not secondary, because it needs to compete with Amplify for the build identity to matter. If it were secondary (like Feedback), it would be additive.

### 2. Retaliate damage = block absorbed, not block gained

Retaliate deals damage equal to what enemies' attacks actually consumed from your block pool. This means:
- More block = more potential retaliation
- Multi-hit attacks consume block across hits, each hit contributing
- Block that isn't consumed (enemy doesn't attack enough) is wasted retaliation potential
- Encourages the player to match block to expected incoming damage, not over-block

### 3. Thorns is flat damage, not scaling

Thorns Core deals a fixed 3 damage per hit taken, regardless of how much damage. This keeps it as a nice passive bonus, not a build-breaking scaler. At 3 damage per hit:
- Against 1 enemy attacking once: 3 bonus damage
- Against Furnace Tick ×3 (3 attacks per turn): 9 bonus damage
- Against multi-hit enemies: more hits = more thorns triggers

This makes Thorns slightly better against swarm/multi-hit encounters, which is a nice counterweight to Retaliate being better against heavy single-hit encounters.

### 4. Fortify as a Torso system card

Fortify occupies the Torso system slot (like other system cards with homeSlot). It costs 2E for 6 block + 6 AoE damage. This is efficient dual-purpose value that both builds want, but Counter players value it more because block IS their offense.

### 5. Current numbers may be overtuned

Sim showed 98.7% win rate with the Counter build vs 85.6% baseline. This is too high. Tuning levers:
- Retaliate could reflect 75% of absorbed block instead of 100%
- Thorns Core could be 2 instead of 3
- Fortify values could be reduced

Tuning is deferred to playtesting. The prototype has the right shape.

## Risks / Trade-offs

**[Counter too strong with high-block equipment]** → Heat Shield (7 block) + Amplify (×1.5 = 10 block) + Retaliate = 10 counter damage per enemy attack. Very strong.
Mitigation: Can reduce Retaliate to 75% ratio if needed. Sim will validate.

**[Thorns + Retaliate double-dipping]** → Both trigger on the same enemy attack. A 12-damage attack into 10 block yields: 10 Retaliate + 3 Thorns = 13 counter damage, plus Arms still fires.
Mitigation: This is the intended payoff for committing two Counter pieces. The investment (part slot + card slot + Torso modifier slot) is real.
