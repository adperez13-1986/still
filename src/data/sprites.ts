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

// ─── Enemy: Corroded Sentry ─────────────────────────────────────────────────
// Hunched turret, 12×12, teal-green corroded

export const CORRODED_SENTRY_SPRITE: SpriteData = {
  art: [
    '....ttTT....',
    '...tTTTTt...',
    '..tTTwTTTt..',
    '..tTTTTTTt..',
    '.ttTTTTTTtt.',
    '.tTTgggTTTt.',
    '.tTTTTTTTTt.',
    '..tTTTTTTt..',
    '..ttT..Ttt..',
    '...tT..Tt...',
    '...tT..Tt...',
    '...tt..tt...',
  ],
  palette: {
    '.': null,
    T: '#1abc9c',
    t: '#0e6655',
    w: '#a3e4d7',
    g: '#145a32',
  },
}

// ─── Enemy: Iron Crawler ────────────────────────────────────────────────────
// Multi-legged crawling machine, 12×12, gunmetal grey

export const IRON_CRAWLER_SPRITE: SpriteData = {
  art: [
    '..i..II..i..',
    '.ii.IIII.ii.',
    '.iIIIIIIIIi.',
    'iIIIwIIwIIIi',
    'iIIIIIIIIIIi',
    '.IIIIIIIIII.',
    '.iIIIIIIIIi.',
    'iI.iIIIIi.Ii',
    'I..iI..Ii..I',
    'i..ii..ii..i',
    '...ii..ii...',
    '...i....i...',
  ],
  palette: {
    '.': null,
    I: '#7f8c8d',
    i: '#4a5568',
    w: '#ecf0f1',
  },
}

// ─── Enemy: Hollow Repeater ─────────────────────────────────────────────────
// Skeletal machine with glowing core, 12×12, pale grey/green

export const HOLLOW_REPEATER_SPRITE: SpriteData = {
  art: [
    '....HHHH....',
    '...HhgghH...',
    '..HhhhhhHH..',
    '..HhhhhhHH..',
    '.HHhhhhhHH..',
    '.HhGGGGhHH..',
    '.HhhhhhhhH..',
    '..HhhhhhhH..',
    '..Hh.HH.hH..',
    '..Hh....hH..',
    '..hh....hh..',
    '..hh....hh..',
  ],
  palette: {
    '.': null,
    H: '#95a5a6',
    h: '#bdc3c7',
    g: '#2ecc71',
    G: '#27ae60',
  },
}

// ─── Enemy: Drifting Frame ──────────────────────────────────────────────────
// Floating chassis, 12×12, dark blue/silver

export const DRIFTING_FRAME_SPRITE: SpriteData = {
  art: [
    '....ddDD....',
    '...dDDDDd...',
    '..dDDsDDDd..',
    '..dDDDDDDd..',
    '.dDDDDDDDDd.',
    '.dDDssssDDd.',
    '.dDDDDDDDDd.',
    '..dDDDDDDd..',
    '...dDDDDd...',
    '..ss.DD.ss..',
    '.ss......ss.',
    '..s......s..',
  ],
  palette: {
    '.': null,
    D: '#34495e',
    d: '#1a252f',
    s: '#bdc3c7',
  },
}

// ─── Enemy: Echo Construct ──────────────────────────────────────────────────
// Crystal-like construct, 12×16, deep purple/pink

export const ECHO_CONSTRUCT_SPRITE: SpriteData = {
  art: [
    '....EEEE....',
    '...EeeeEE...',
    '..EeePPeeE..',
    '..EeeeeeEE..',
    '.EEeeeeeEE..',
    '.EeEEEEeEE..',
    '.EeeeeeeeE..',
    'EEeeeeeeeEE.',
    'EeEEEEEEEeE.',
    '.EeeeeeeeE..',
    '..EEeeeeEE..',
    '...EeeeE....',
    '...EeeeE....',
    '...EeeeE....',
    '..EEeeeEE...',
    '..EEeeeEE...',
  ],
  palette: {
    '.': null,
    E: '#8e44ad',
    e: '#c39bd3',
    P: '#f5b7b1',
  },
}

// ─── Elite: Vault Keeper ────────────────────────────────────────────────────
// Heavy armored guard, 12×16, dark gold/brown

export const VAULT_KEEPER_SPRITE: SpriteData = {
  art: [
    '....GGGG....',
    '...GGggGG...',
    '..GGgwgwGG..',
    '..GGggggGG..',
    '..GGGGGGGG..',
    '.GGGGGGGGGG.',
    '.GGgbbbgGGG.',
    '.GGGGGGGGGG.',
    'GGGGbbbbGGGG',
    '.GGGGGGGGGG.',
    '..GGGGGGGG..',
    '..GG....GG..',
    '.GGG....GGG.',
    '.GGG....GGG.',
    '..GG....GG..',
    '..gg....gg..',
  ],
  palette: {
    '.': null,
    G: '#b7950b',
    g: '#7d6608',
    w: '#f9e79f',
    b: '#4a3f05',
  },
}

// ─── Elite: Corrupted Overseer ──────────────────────────────────────────────
// Tall menacing figure, 12×16, dark purple/red

export const CORRUPTED_OVERSEER_SPRITE: SpriteData = {
  art: [
    '....CCCC....',
    '...CcccCC...',
    '..CcrCCrcC..',
    '..CcccccCC..',
    '..CCCCCCCC..',
    '.rCCCCCCCCr.',
    '.rCcrrrrCCr.',
    '.rCCCCCCCCr.',
    '..CCCCCCCC..',
    '..CcccccCC..',
    '..CCCCCCCC..',
    '..CC....CC..',
    '..CC....CC..',
    '..Cc....cC..',
    '..cc....cc..',
    '..cc....cc..',
  ],
  palette: {
    '.': null,
    C: '#6c3483',
    c: '#4a235a',
    r: '#e74c3c',
  },
}

// ─── Elite: Fracture Titan ──────────────────────────────────────────────────
// Massive cracked automaton, 12×16, red/dark grey

export const FRACTURE_TITAN_SPRITE: SpriteData = {
  art: [
    '...FFFFFF...',
    '..FFfffFFF..',
    '.FFfrFFrfFF.',
    '.FFffffffFF.',
    '.FFFFFFFFFF.',
    'FFFFFFFFFFFF',
    'FFfrrrrrfFFF',
    'FFFFFFFFFFFF',
    'FFFFFrrFFFFF',
    'FFFFFFFFFFFF',
    '.FFFFFFFFFF.',
    '.FF......FF.',
    'FFF......FFF',
    'FFF......FFF',
    '.FF......FF.',
    '.ff......ff.',
  ],
  palette: {
    '.': null,
    F: '#7f8c8d',
    f: '#4a5568',
    r: '#e74c3c',
  },
}

// ─── Sector 2 Enemy: Thermal Leech ──────────────────────────────────────────
// Slug-like heat absorber, 12×12, warm orange/dark red

export const THERMAL_LEECH_SPRITE: SpriteData = {
  art: [
    '....ooOO....',
    '...oOOOOo...',
    '..oOOrOOrOo.',
    '..oOOOOOOo..',
    '.oOOOOOOOOo.',
    '.oOOOOOOOOo.',
    '.oOOOOOOOOo.',
    '..oOOOOOOo..',
    '...oOOOOo...',
    '..rr.oo.rr..',
    '.rr......rr.',
    '..r......r..',
  ],
  palette: {
    '.': null,
    O: '#e67e22',
    o: '#a04000',
    r: '#c0392b',
  },
}

// ─── Sector 2 Enemy: Wire Jammer ────────────────────────────────────────────
// Angular antenna device, 12×12, electric yellow/blue

export const WIRE_JAMMER_SPRITE: SpriteData = {
  art: [
    'b...b..b...b',
    '.b..b..b..b.',
    '..bbbbbbbb..',
    '...bBBBBb...',
    '..bBByyBBb..',
    '..bBBBBBBb..',
    '..bBByBBBb..',
    '...bBBBBb...',
    '....bBBb....',
    '....bBBb....',
    '...bbBBbb...',
    '..bb.bb.bb..',
  ],
  palette: {
    '.': null,
    B: '#2c3e50',
    b: '#1a252f',
    y: '#f1c40f',
  },
}

// ─── Sector 2 Enemy: Slag Heap ──────────────────────────────────────────────
// Massive bulk of slag, 12×12, dark grey/brown

export const SLAG_HEAP_SPRITE: SpriteData = {
  art: [
    '...SSSSSS...',
    '..SSssssSSS.',
    '.SssSSSssSS.',
    '.SsssssssSS.',
    'SsssssssssS.',
    'SSSSSSSSSSsS',
    'SsssssssssS.',
    'SssssssssSS.',
    '.SsssssssSS.',
    '.SSssssSSS..',
    '..SSSSsSS...',
    '...SSSSSS...',
  ],
  palette: {
    '.': null,
    S: '#5d4e37',
    s: '#8d7b68',
  },
}

// ─── Sector 2 Enemy: Feedback Loop ──────────────────────────────────────────
// Spinning ring with bright core, 12×12, cyan/white

export const FEEDBACK_LOOP_SPRITE: SpriteData = {
  art: [
    '....cccc....',
    '..ccCCCCcc..',
    '.cCC....CCc.',
    '.cC..ww..Cc.',
    'cC..wWWw..Cc',
    'cC..wWWw..Cc',
    'cC..wWWw..Cc',
    '.cC..ww..Cc.',
    '.cCC....CCc.',
    '..ccCCCCcc..',
    '....cccc....',
    '............',
  ],
  palette: {
    '.': null,
    C: '#00bcd4',
    c: '#00838f',
    W: '#ffffff',
    w: '#b2ebf2',
  },
}

// ─── Sector 2 Enemy: Phase Drone ────────────────────────────────────────────
// Ghostly floating drone, 12×12, pale blue/translucent

export const PHASE_DRONE_SPRITE: SpriteData = {
  art: [
    '....ppPP....',
    '...pPPPPp...',
    '..pPPwPPPp..',
    '..pPPPPPPp..',
    '.pPPPPPPPPp.',
    '.pPPwPPwPPp.',
    '.pPPPPPPPPp.',
    '..pPPPPPPp..',
    '...pPPPPp...',
    '....pppp....',
    '...l.ll.l...',
    '..l......l..',
  ],
  palette: {
    '.': null,
    P: '#85c1e9',
    p: '#5499c7',
    w: '#eaf2f8',
    l: '#3498db',
  },
}

// ─── Sector 2 Enemy: Furnace Tick ───────────────────────────────────────────
// Tiny fire bug, 12×12, bright orange/yellow

export const FURNACE_TICK_SPRITE: SpriteData = {
  art: [
    '....ffFF....',
    '...fFFFFf...',
    '..fFFyFFf...',
    '..fFFFFFFf..',
    '.fFFFFFFFf..',
    '.fFFyFFyFf..',
    '..fFFFFFFf..',
    '...fFFFFf...',
    'f.f.fFFf.f.f',
    '.f...ff...f.',
    '..f......f..',
    '............',
  ],
  palette: {
    '.': null,
    F: '#e67e22',
    f: '#a04000',
    y: '#f9e79f',
  },
}

// ─── Sector 2 Enemy: Static Frame ───────────────────────────────────────────
// Humanoid frame with sparks, 12×16, grey/blue

export const STATIC_FRAME_SPRITE: SpriteData = {
  art: [
    '....SSSS....',
    '...SSssSS...',
    '..SSsBBsSS..',
    '..SSssssSS..',
    '..SSSSSSSS..',
    '.SSSSSSSSSS.',
    '.SSsbbbsSS..',
    '.SSSSSSSSSS.',
    '..SSSSSSSS..',
    '..SS....SS..',
    '.SSS....SSS.',
    '.SSS....SSS.',
    '..SS....SS..',
    '..SS....SS..',
    '..ss....ss..',
    '..ss....ss..',
  ],
  palette: {
    '.': null,
    S: '#7f8c8d',
    s: '#566573',
    B: '#5dade2',
    b: '#2e86c1',
  },
}

// ─── Sector 2 Enemy: Conduit Spider ─────────────────────────────────────────
// Spider shape, 12×12, dark purple/green

export const CONDUIT_SPIDER_SPRITE: SpriteData = {
  art: [
    'p..p....p..p',
    '.pp.pPPp.pp.',
    '..pPPPPPPp..',
    '..PPPgPgPP..',
    '.pPPPPPPPPp.',
    'pPPPPPPPPPPp',
    '.pPPPPPPPPp.',
    '..PPPPPPPp..',
    'p.p.pPPp.p.p',
    '.p...pp...p.',
    '..p......p..',
    '............',
  ],
  palette: {
    '.': null,
    P: '#6c3483',
    p: '#4a235a',
    g: '#2ecc71',
  },
}

// ─── Sector 2 Elite: Overcharge Sentinel ────────────────────────────────────
// Large armored with gold glow, 12×16, dark steel/gold

export const OVERCHARGE_SENTINEL_SPRITE: SpriteData = {
  art: [
    '...gGGGGg...',
    '..gGGggGGg..',
    '.gGGgYYgGGg.',
    '.gGGggggGGg.',
    '.gGGGGGGGGg.',
    'gGGGGGGGGGGg',
    'gGGgYYYYgGGg',
    'gGGGGGGGGGGg',
    'gGGGYYYYGGGg',
    'gGGGGGGGGGGg',
    '.gGGGGGGGGg.',
    '.gGg....gGg.',
    'gGGg....gGGg',
    'gGGg....gGGg',
    '.gGg....gGg.',
    '.gg......gg.',
  ],
  palette: {
    '.': null,
    G: '#4a5568',
    g: '#2d3436',
    Y: '#f1c40f',
  },
}

// ─── Sector 2 Elite: Lockdown Warden ────────────────────────────────────────
// Heavy blocky form with chains, 12×16, dark red/iron

export const LOCKDOWN_WARDEN_SPRITE: SpriteData = {
  art: [
    '...LLLLLL...',
    '..LLllllLL..',
    '.LLlrLLrlLL.',
    '.LLllllllLL.',
    '.LLLLLLLLLL.',
    'rLLLLLLLLLLr',
    'rLLlrrrrLLLr',
    'rLLLLLLLLLLr',
    '.LLLLLLLLLL.',
    '.LLllllllLL.',
    '.LLLLLLLLLL.',
    '.LL......LL.',
    'LLL......LLL',
    'LLL......LLL',
    '.LL......LL.',
    '.ll......ll.',
  ],
  palette: {
    '.': null,
    L: '#7b241c',
    l: '#4a1610',
    r: '#c0392b',
  },
}

// ─── Sector 2 Elite: Meltdown Core ──────────────────────────────────────────
// Pulsing hot orb, 12×16, bright red/orange/white core

export const MELTDOWN_CORE_SPRITE: SpriteData = {
  art: [
    '....rrrr....',
    '...rRRRRr...',
    '..rRROORRr..',
    '.rRROOOORRr.',
    '.rROOWWOORr.',
    'rRROWWWWORRr',
    'rRROWWWWORRr',
    '.rROOWWOORr.',
    '.rRROOOORRr.',
    '..rRROORRr..',
    '...rRRRRr...',
    '....rrrr....',
    '...rr.rr.r..',
    '..r...r..r..',
    '.r..........',
    '............',
  ],
  palette: {
    '.': null,
    R: '#e74c3c',
    r: '#922b21',
    O: '#e67e22',
    W: '#f9e79f',
  },
}

// ─── Sector 2 Boss: The Thermal Arbiter ─────────────────────────────────────
// Large imposing judge figure, 16×20, black/red/gold

export const THE_THERMAL_ARBITER_SPRITE: SpriteData = {
  art: [
    '....GGAAAAGG....',
    '...GAAAAAAAAAg..',
    '..GAAArAArAAGG..',
    '..GAAAAAAAAAAg..',
    '..GGAAAAAAGGg...',
    '...GGAAAAGGg....',
    'rGGGGGGGGGGGGGGr',
    'rGGAGGGGGGGAGGGr',
    'GGGGGrrrrrGGGGGG',
    'GGAGGGGGGGGGAGGr',
    'GGGGGrrrrrGGGGGG',
    'rGGAGGGGGGGAGGGr',
    'rGGGGGGGGGGGGGGr',
    '..GGGAAAAAGGGg..',
    '..GGAAAAAAGGGg..',
    '.gGGGG...GGGGg..',
    '.gGGGG...GGGGg..',
    '.gGGGG...GGGGg..',
    '..GGGG...GGGG...',
    '..gggg...gggg...',
  ],
  palette: {
    '.': null,
    A: '#1a1a2e',
    G: '#4a4a5a',
    g: '#2d2d3a',
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
  // S1 standard
  'wandering-drone': WANDERING_DRONE_SPRITE,
  'fracture-mite': FRACTURE_MITE_SPRITE,
  'rust-guard': RUST_GUARD_SPRITE,
  'corroded-sentry': CORRODED_SENTRY_SPRITE,
  'iron-crawler': IRON_CRAWLER_SPRITE,
  'glitch-node': GLITCH_NODE_SPRITE,
  'sentinel-shard': SENTINEL_SHARD_SPRITE,
  'hollow-repeater': HOLLOW_REPEATER_SPRITE,
  'drifting-frame': DRIFTING_FRAME_SPRITE,
  'echo-construct': ECHO_CONSTRUCT_SPRITE,
  // S1 elite
  'vault-keeper': VAULT_KEEPER_SPRITE,
  'corrupted-overseer': CORRUPTED_OVERSEER_SPRITE,
  'fracture-titan': FRACTURE_TITAN_SPRITE,
  // S1 boss
  'the-first-warden': THE_FIRST_WARDEN_SPRITE,
  // S2 standard
  'thermal-leech': THERMAL_LEECH_SPRITE,
  'wire-jammer': WIRE_JAMMER_SPRITE,
  'slag-heap': SLAG_HEAP_SPRITE,
  'feedback-loop': FEEDBACK_LOOP_SPRITE,
  'phase-drone': PHASE_DRONE_SPRITE,
  'furnace-tick': FURNACE_TICK_SPRITE,
  'static-frame': STATIC_FRAME_SPRITE,
  'conduit-spider': CONDUIT_SPIDER_SPRITE,
  // S2 elite
  'overcharge-sentinel': OVERCHARGE_SENTINEL_SPRITE,
  'lockdown-warden': LOCKDOWN_WARDEN_SPRITE,
  'meltdown-core': MELTDOWN_CORE_SPRITE,
  // S2 boss
  'the-thermal-arbiter': THE_THERMAL_ARBITER_SPRITE,
}

export function getEnemySprite(definitionId: string): SpriteData {
  return ENEMY_SPRITES[definitionId] ?? UNKNOWN_SPRITE
}
