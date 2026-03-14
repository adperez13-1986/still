## Context

`resolveDrops` currently picks the best shard entry, then rolls a weighted random across bonus entries (card/part/equipment). Many enemies have shard weight 3-4 vs bonus weight 1, so ~75% of drops are shard-only. The player fights, takes damage, and gets 8 shards.

## Goals / Non-Goals

**Goals:**
- Every combat rewards shards + a 3-card choice (like StS)
- Part/equipment drops remain special (enemy-specific bonus on top)
- Minimal change to enemy data — simplify rather than rewrite

**Non-Goals:**
- Changing the reward screen UI (already handles mixed drops)
- Changing elite/boss drop logic or warper drops
- Rebalancing shard amounts (can tune later)

## Decisions

### Always award shards + card choice
`resolveDrops` will always return: shards + 3 card choices + optional part/equipment bonus.

**Alternative considered:** Make card choice replace shard-only (keep the roll). Rejected — a guaranteed card choice after every combat is the genre standard and creates the deck-building decisions that make the game interesting.

### Remove card entries from enemy drop pools
Since card choice is now guaranteed, `card` entries in enemy `dropPool` arrays serve no purpose. Remove them, leaving only `shards`, `part`, and `equipment` entries. This simplifies the data.

### Part/equipment as independent bonus roll
After the guaranteed shards + cards, roll for a part or equipment drop from the enemy's remaining pool entries. If the enemy has part/equipment entries, do a weighted roll among them. Equipment pity still applies. If none exist, no bonus — the card choice is the reward.

### Structure of resolveDrops return
```
Always:  shards (from enemy pool or fallback 5)
Always:  3 card choices (from sector pool)
Maybe:   1 part or equipment (from enemy bonus pool, with pity)
```
