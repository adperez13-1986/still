## Why

Parts collected during a run currently vanish when the run ends. This discards the sense of accumulation and resilience that defines Still's identity. Giving the player one part to carry forward — fragile, repairable, eventually gone — makes survival feel meaningful across runs.

## What Changes

- At the end of every run (win or loss), the player chooses 1 part to carry into the next run
- The carried part has a durability counter; each combat has a chance to reduce it
- When durability reaches 0, the part becomes inactive (grayed out, visible but inert) — not discarded
- The workshop gains a Repair option: restores durability for shards, but has a limited number of uses
- When a part with no repairs left breaks again, it is permanently destroyed with a farewell message
- A carried part (intact or broken) can be replaced at end-of-run with a new choice
- Runs can start with a broken carried part — the player may route toward the workshop to restore it

## Capabilities

### New Capabilities

- `carried-part`: Persistent carried part across runs — durability, break mechanic, repair at workshop, permanent destruction

### Modified Capabilities

- `progression`: Workshop gains a Repair action; end-of-run flow gains a carry selection step

## Impact

- New persistent meta-state (localStorage) for the carried part
- `RunState` extended to include carried part status
- `CombatState` / post-combat logic: break roll after each combat won
- Workshop screen: new Repair option
- End-of-run screen: new part selection step
- Equips overlay: broken/grayed visual state for carried part
