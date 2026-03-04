// ─── Sprite Definitions ───────────────────────────────────────────────────────
// Each sprite is a string array (pixel grid) + palette (char → hex or null for transparent)
// '.' is always transparent

export interface SpriteData {
  art: string[]
  palette: Record<string, string | null>
}

// ─── Still (player) ──────────────────────────────────────────────────────────
// 16×16, cool lavender/violet palette
// P = light purple body, p = mid purple, d = dark purple
// B = blue glow (eyes), W = white highlight
// G = dark grey joint, g = black shadow

export const STILL_SPRITE: SpriteData = {
  art: [
    '....ppPPPPpp....',
    '...pPPPPPPPPp...',
    '..pPP.BPPB.PPp..',
    '..pPPPPPPPPPPp..',
    '..ppPPWPPWPPpp..',
    '....pPPPPPPp....',
    '.GpPPPPPPPPPPpG.',
    '.GpPWPPPPPPWPpG.',
    '.GpPPGggggGPPpG.',
    '.GpPPPPPPPPPPpG.',
    '..GpPPPPPPPPpG..',
    '..GGpPPPPPPpGG..',
    '...Gpp....ppG...',
    '...Gpp....ppG...',
    '...Gpp....ppG...',
    '..GGpp....ppGG..',
  ],
  palette: {
    '.': null,
    P: '#b2a4f5',
    p: '#7c6fd4',
    d: '#5a4fb0',
    B: '#74b9ff',
    W: '#dfe6e9',
    G: '#636e72',
    g: '#2d3436',
  },
}

// ─── Enemy: Wandering Drone ───────────────────────────────────────────────────
// Small floating sphere, 12×12, dim yellow-grey

export const WANDERING_DRONE_SPRITE: SpriteData = {
  art: [
    '....yyyy....',
    '..yyYYYYyy..',
    '.yYYYwYYYYy.',
    '.yYYYYYYYYy.',
    'yYYYYYYYYYYy',
    'yYYwYYYYwYYy',
    'yYYYYYYYYYYy',
    '.yYrYYYYrYy.',
    '.yYYYYYYYYy.',
    '..yyYYYYyy..',
    '....llll....',
    '....llll....',
  ],
  palette: {
    '.': null,
    Y: '#b8a86a',
    y: '#7a6e3c',
    w: '#f5e6a0',
    r: '#e07830',
    l: '#5a5030',
  },
}

// ─── Enemy: Fracture Mite ─────────────────────────────────────────────────────
// Small crab-like, 12×12, rust red

export const FRACTURE_MITE_SPRITE: SpriteData = {
  art: [
    'r..rRRRRr..r',
    'rr.rRRRRr.rr',
    '.rrRRRRRRrr.',
    '.rRRwRRwRRr.',
    'rRRRRRRRRRRr',
    'rRRRRRRRRRRr',
    '.rRRRRRRRRr.',
    'rR.rRRRRr.Rr',
    'R..rR..Rr..R',
    'r..rr..rr..r',
    '...rr..rr...',
    '...r....r...',
  ],
  palette: {
    '.': null,
    R: '#c0392b',
    r: '#7b241c',
    w: '#f5b7b1',
  },
}

// ─── Enemy: Rust Guard ────────────────────────────────────────────────────────
// Humanoid soldier, 12×16, orange-brown armour

export const RUST_GUARD_SPRITE: SpriteData = {
  art: [
    '....OOOO....',
    '...OOooOO...',
    '..OOwOOwOO..',
    '..OOOOOOOO..',
    '..OOOOOOOO..',
    '.OOOOOOOOOO.',
    '.OOoooooOOO.',
    '.OOOOOOOOOO.',
    '..OO....OO..',
    '.OOO....OOO.',
    '.OOO....OOO.',
    '.OOO....OOO.',
    '..OO....OO..',
    '..OO....OO..',
    '..oo....oo..',
    '..oo....oo..',
  ],
  palette: {
    '.': null,
    O: '#d35400',
    o: '#7d3c00',
    w: '#fad7a0',
  },
}

// ─── Enemy: Glitch Node ───────────────────────────────────────────────────────
// Floating geometric node, 12×12, electric purple/cyan

export const GLITCH_NODE_SPRITE: SpriteData = {
  art: [
    '....GcGG....',
    '..GGccccGG..',
    '.GccCCCCccG.',
    '.GcCCwwCCcG.',
    'GccCwwwwCccG',
    'GcCCwwwwCCcG',
    'GcCCwwwwCCcG',
    'GccCwwwwCccG',
    '.GcCCwwCCcG.',
    '.GccCCCCccG.',
    '..GGccccGG..',
    '....GcGG....',
  ],
  palette: {
    '.': null,
    G: '#6c3483',
    c: '#9b59b6',
    C: '#c39bd3',
    w: '#d2f5ff',
  },
}

// ─── Enemy: Sentinel Shard ───────────────────────────────────────────────────
// Crystal-armoured sentinel, 12×16, steel blue

export const SENTINEL_SHARD_SPRITE: SpriteData = {
  art: [
    '....SSSS....',
    '...SssssSS..',
    '..SssBBsssS.',
    '..SssssssS..',
    '.SssssssssS.',
    '.SsSSSSSsSS.',
    '.SssssssssS.',
    'SSsssssssSS.',
    'SssSSSSSSssS',
    '.SssssssssS.',
    '..SSssssSSS.',
    '...SssssS...',
    '...SssssS...',
    '...SssssS...',
    '..SSssssSSS.',
    '..SSssssSSS.',
  ],
  palette: {
    '.': null,
    S: '#2e86c1',
    s: '#7fb3d3',
    B: '#d4e6f1',
  },
}

// ─── Boss: The First Warden ───────────────────────────────────────────────────
// Large imposing machine guardian, 16×20, dark iron with crimson accents

export const THE_FIRST_WARDEN_SPRITE: SpriteData = {
  art: [
    '....IIIIIIII....',
    '...IIiiiiiIII...',
    '..IIiRiiRiiII...',
    '..IIiiiiiiiII...',
    '..IIIiiiiiIII...',
    '...IIiiiiiII....',
    '.IIIIIIIIIIIIi..',
    '.IIiIIIIIIIiII..',
    'IIIIIrrrrrIIIII.',
    'IIiIIIIIIIIIiII.',
    'IIIIIrrrrrIIIII.',
    '.IIiIIIIIIIiII..',
    '.IIIIIIIIIIIIi..',
    '..IIIiiiiiIII...',
    '..IIiiiiiiiII...',
    '.iIII.....IIIi..',
    '.iIII.....IIIi..',
    '.iIII.....IIIi..',
    '..III.....III...',
    '..iii.....iii...',
  ],
  palette: {
    '.': null,
    I: '#4a4a5a',
    i: '#2d2d3a',
    R: '#ff4757',
    r: '#c0392b',
  },
}

// ─── Fallback sprite (unknown enemy) ─────────────────────────────────────────

export const UNKNOWN_SPRITE: SpriteData = {
  art: [
    '....XXXX....',
    '...XXXXXXX..',
    '..XxXXXXxXX.',
    '..XXXXXXXXX.',
    '.XXXXXXXXXXX',
    '.XXXXXXXXXXX',
    '.XXXXXXXXXXX',
    '..XXXXXXXXX.',
    '...XXXXXXX..',
    '....XXXXX...',
    '.....XXX....',
    '......X.....',
  ],
  palette: {
    '.': null,
    X: '#636e72',
    x: '#b2bec3',
  },
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const ENEMY_SPRITES: Record<string, SpriteData> = {
  'wandering-drone': WANDERING_DRONE_SPRITE,
  'fracture-mite': FRACTURE_MITE_SPRITE,
  'rust-guard': RUST_GUARD_SPRITE,
  'glitch-node': GLITCH_NODE_SPRITE,
  'sentinel-shard': SENTINEL_SHARD_SPRITE,
  'the-first-warden': THE_FIRST_WARDEN_SPRITE,
}

export function getEnemySprite(definitionId: string): SpriteData {
  return ENEMY_SPRITES[definitionId] ?? UNKNOWN_SPRITE
}
