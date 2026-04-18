/**
 * Heuristic profiles for the strain combat simulator.
 *
 * Each profile tunes how the AI plays: when to vent, how many slots to push,
 * which slot types to prioritize, and which rewards to take. Use to compare
 * the effects of different playstyles on run win rates.
 */

export interface HeuristicProfile {
  name: string

  // ─── Combat: when to vent ───────────────────────────────────────────────
  /** Vent if strain >= this AND HP is healthy */
  ventStrainThresholdHealthy: number
  /** Vent if strain >= this AND HP is low */
  ventStrainThresholdLowHp: number
  /** HP ratio considered "healthy" (above this uses healthy threshold) */
  healthyHpRatio: number
  /** Emergency vent (strain >= this, vent no matter what) */
  emergencyVentStrain: number

  // ─── Combat: push aggression ────────────────────────────────────────────
  /** Max slots pushed in a single turn */
  maxPushesPerTurn: number
  /** Buffer strain kept under max (leaves room for future turns) */
  strainBuffer: number

  // ─── Combat: slot scoring weights ───────────────────────────────────────
  damageScoreMultiplier: number
  blockScoreMultiplier: number
  healSlotScoreMultiplier: number
  reduceScoreMultiplier: number
  utilityScoreMultiplier: number

  // ─── Rewards: action preference scores ──────────────────────────────────
  healActionBonus: number
  blockActionBonus: number
  reduceActionBonus: number
  reflectActionBonus: number
  damageSingleActionBonus: number
  damageAllActionBonus: number
  buffActionBonus: number
  debuffActionBonus: number
  convertActionBonus: number
  utilityActionBonus: number
  /** Extra bonus if we don't have any heal action yet */
  firstHealBonus: number

  // ─── Rewards: comfort vs growth thresholds ──────────────────────────────
  /** HP ratio below which we auto-pick heal comfort */
  criticalHealHpRatio: number
  /** Effective strain at/above which we prefer relief comfort */
  reliefStrainThreshold: number
  /** Take growth only if effective strain + take cost would be < this */
  growthStrainCap: number
  /** When filling empty slot, allow slightly higher strain ceiling */
  growthStrainCapEmptySlot: number
}

// ─── Profiles ─────────────────────────────────────────────────────────────

export const BALANCED_PROFILE: HeuristicProfile = {
  name: 'balanced',
  ventStrainThresholdHealthy: 7,
  ventStrainThresholdLowHp: 11,
  healthyHpRatio: 0.5,
  emergencyVentStrain: 14,
  maxPushesPerTurn: 3,
  strainBuffer: 6,
  damageScoreMultiplier: 1,
  blockScoreMultiplier: 1,
  healSlotScoreMultiplier: 1,
  reduceScoreMultiplier: 1,
  utilityScoreMultiplier: 1,
  healActionBonus: 3,
  blockActionBonus: 3,
  reduceActionBonus: 2,
  reflectActionBonus: 2,
  damageSingleActionBonus: 1,
  damageAllActionBonus: 1,
  buffActionBonus: 2,
  debuffActionBonus: 2,
  convertActionBonus: 3,
  utilityActionBonus: 1,
  firstHealBonus: 5,
  criticalHealHpRatio: 0.35,
  reliefStrainThreshold: 9,
  growthStrainCap: 12,
  growthStrainCapEmptySlot: 14,
}

/** Defensive: vent earlier, push fewer slots, prioritize survival rewards */
export const DEFENSIVE_PROFILE: HeuristicProfile = {
  name: 'defensive',
  ventStrainThresholdHealthy: 5,
  ventStrainThresholdLowHp: 9,
  healthyHpRatio: 0.6,
  emergencyVentStrain: 12,
  maxPushesPerTurn: 2,
  strainBuffer: 8,
  damageScoreMultiplier: 0.7,
  blockScoreMultiplier: 2,
  healSlotScoreMultiplier: 2,
  reduceScoreMultiplier: 2,
  utilityScoreMultiplier: 1,
  healActionBonus: 6,
  blockActionBonus: 6,
  reduceActionBonus: 5,
  reflectActionBonus: 4,
  damageSingleActionBonus: 0,
  damageAllActionBonus: 0,
  buffActionBonus: 1,
  debuffActionBonus: 3,
  convertActionBonus: 5,
  utilityActionBonus: 2,
  firstHealBonus: 10,
  criticalHealHpRatio: 0.5,
  reliefStrainThreshold: 6,
  growthStrainCap: 10,
  growthStrainCapEmptySlot: 12,
}

/** Aggressive: push more, vent later, prioritize damage */
export const AGGRESSIVE_PROFILE: HeuristicProfile = {
  name: 'aggressive',
  ventStrainThresholdHealthy: 10,
  ventStrainThresholdLowHp: 13,
  healthyHpRatio: 0.4,
  emergencyVentStrain: 16,
  maxPushesPerTurn: 4,
  strainBuffer: 3,
  damageScoreMultiplier: 2,
  blockScoreMultiplier: 0.5,
  healSlotScoreMultiplier: 0.5,
  reduceScoreMultiplier: 0.5,
  utilityScoreMultiplier: 1,
  healActionBonus: 1,
  blockActionBonus: 1,
  reduceActionBonus: 1,
  reflectActionBonus: 1,
  damageSingleActionBonus: 4,
  damageAllActionBonus: 4,
  buffActionBonus: 3,
  debuffActionBonus: 1,
  convertActionBonus: 1,
  utilityActionBonus: 1,
  firstHealBonus: 2,
  criticalHealHpRatio: 0.25,
  reliefStrainThreshold: 12,
  growthStrainCap: 15,
  growthStrainCapEmptySlot: 17,
}

export const PROFILES: Record<string, HeuristicProfile> = {
  balanced: BALANCED_PROFILE,
  defensive: DEFENSIVE_PROFILE,
  aggressive: AGGRESSIVE_PROFILE,
}

export function getProfile(name: string): HeuristicProfile {
  const profile = PROFILES[name]
  if (!profile) throw new Error(`Unknown profile: ${name}. Available: ${Object.keys(PROFILES).join(', ')}`)
  return profile
}
