import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { ALL_ENEMIES } from '../data/enemies'
import { ALL_ACTIONS, FINDABLE_ACTIONS, getSynergyForPair } from '../data/actions'
import {
  STRAIN_DECAY_BETWEEN_COMBATS,
  VENT_STRAIN_RECOVERY,
  getEnemyIntent,
  projectedStrain,
  projectedStrainCost,
  wouldForfeit,
} from '../game/strainCombat'
import type { StrainCombatEvent } from '../game/strainCombat'
import type { ActionDefinition, EnemyInstance } from '../game/types'

// ─── Helpers ────────────────────────────────────────────────────────────

function getGrowthOffers(acquiredActions: string[]): ActionDefinition[] {
  const available = FINDABLE_ACTIONS.filter(a => !acquiredActions.includes(a.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

function getComfortReward(health: number, maxHealth: number, strain: number) {
  if (health < maxHealth * 0.5) return { id: 'heal', label: 'Rest', description: 'Heal 8 HP' }
  if (strain >= 10) return { id: 'relief', label: 'Relief', description: '-4 strain' }
  return { id: 'companion', label: 'Companion', description: '-2 strain' }
}

function typeLabel(type: string): string {
  switch (type) {
    case 'damage_single': return 'DMG'
    case 'damage_all': return 'AOE'
    case 'block': return 'BLK'
    case 'heal': return 'HEAL'
    case 'reduce': return 'REDUCE'
    case 'reflect': return 'REFLECT'
    case 'buff': return 'BUFF'
    case 'debuff': return 'DEBUFF'
    case 'convert': return 'CONVERT'
    case 'utility': return 'UTIL'
    case 'recovery': return 'VENT'
    default: return type.toUpperCase()
  }
}

function typeColor(type: string): string {
  switch (type) {
    case 'damage_single': return '#e74c3c'
    case 'damage_all': return '#e74c3c'
    case 'block': return '#3498db'
    case 'heal': return '#2ecc71'
    case 'reduce': return '#e67e22'
    case 'reflect': return '#9b59b6'
    case 'buff': return '#f1c40f'
    case 'debuff': return '#e67e22'
    case 'convert': return '#1abc9c'
    case 'utility': return '#95a5a6'
    case 'recovery': return '#636e72'
    default: return '#aaa'
  }
}

// ─── Strain Meter ────────────────────────────────────────────────────────

function StrainMeter({ current, projected, max }: { current: number; projected: number; max: number }) {
  const pct = (current / max) * 100
  const projPct = (projected / max) * 100
  const barColor = current <= 7 ? '#636e72' : current <= 14 ? '#e67e22' : '#e74c3c'
  const projColor = projected >= max ? '#c0392b' : '#f39c12'

  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
        <span style={{ fontWeight: 600 }}>STRAIN</span>
        <span>{current}{projected !== current ? ` → ${projected}` : ''} / {max}</span>
      </div>
      <div style={{ height: 20, background: '#2d3436', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        {projected > current && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${projPct}%`, background: projColor, opacity: 0.4, transition: 'width 0.2s' }} />
        )}
        {projected < current && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: '#2ecc71', opacity: 0.3, transition: 'width 0.2s' }} />
        )}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(pct, projPct)}%`, background: barColor, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

// ─── Action Slot ─────────────────────────────────────────────────────────

function ActionSlot({
  actionId, pushed, onToggle, disabled, bonusValue,
}: {
  actionId: string | null
  pushed: boolean
  onToggle: () => void
  disabled: boolean
  bonusValue: number
}) {
  if (!actionId) {
    return (
      <div style={{
        flex: 1, padding: '12px 8px', background: '#1a1a2e', border: '2px solid #333',
        borderRadius: 8, textAlign: 'center', color: '#555', fontSize: 13,
      }}>
        Empty
      </div>
    )
  }
  const action = ALL_ACTIONS[actionId]
  if (!action) return null

  const isVent = !!action.isVent
  const value = pushed ? action.pushedValue : action.baseValue
  const displayValue = value + (isVent ? 0 : bonusValue)

  return (
    <button
      onClick={onToggle}
      disabled={disabled || isVent}
      style={{
        flex: 1, padding: '10px 6px',
        background: pushed ? '#2d3436' : '#1a1a2e',
        border: pushed ? '2px solid #e67e22' : isVent ? '2px solid #636e72' : '2px solid #444',
        borderRadius: 8, color: '#fff',
        cursor: disabled || isVent ? 'default' : 'pointer',
        textAlign: 'center', transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: 11, color: typeColor(action.type), fontWeight: 600 }}>{typeLabel(action.type)}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{action.name}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: pushed ? '#e67e22' : '#dfe6e9', marginTop: 2 }}>
        {isVent ? `-${VENT_STRAIN_RECOVERY}` : displayValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''}
      </div>
      {pushed && !isVent && <div style={{ fontSize: 10, color: '#e67e22', marginTop: 4 }}>PUSHED</div>}
      {isVent && <div style={{ fontSize: 10, color: '#636e72', marginTop: 4 }}>strain recovery</div>}
      {!pushed && !isVent && <div style={{ fontSize: 10, color: '#636e72', marginTop: 4 }}>tap to push</div>}
    </button>
  )
}

// ─── Enemy Display ───────────────────────────────────────────────────────

function EnemyDisplay({ enemy, selected, onClick }: { enemy: EnemyInstance; selected?: boolean; onClick?: () => void }) {
  const def = ALL_ENEMIES[enemy.definitionId]
  if (!def || enemy.isDefeated) return null

  const intent = getEnemyIntent(enemy)
  const hpPct = (enemy.currentHealth / enemy.maxHealth) * 100

  return (
    <div
      onClick={onClick}
      style={{
        background: '#1a1a2e',
        border: selected ? '2px solid #e74c3c' : '1px solid #444',
        borderRadius: 8, padding: 12, minWidth: 120, textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{def.name}</div>
      <div style={{ height: 8, background: '#2d3436', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${hpPct}%`, background: '#e74c3c', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
        {enemy.currentHealth} / {enemy.maxHealth} HP
        {enemy.block > 0 && <span style={{ color: '#3498db' }}> | {enemy.block} BLK</span>}
      </div>
      {intent && (
        <div style={{
          fontSize: 13, padding: '4px 8px', borderRadius: 4,
          background: ['Attack', 'AttackDebuff', 'Retaliate', 'StrainScale', 'CopyAction', 'Leech', 'Enrage', 'BerserkerAttack', 'PhaseShift', 'MartyrHeal'].includes(intent.type) ? '#c0392b33'
            : intent.type === 'Charge' && enemy.chargeCounter === 0 ? '#c0392b33'
            : intent.type === 'StrainTick' ? '#e67e2233' : '#2d3436',
          color: ['Attack', 'AttackDebuff', 'Retaliate', 'StrainScale', 'Leech', 'Enrage', 'BerserkerAttack', 'PhaseShift', 'MartyrHeal'].includes(intent.type) ? '#e74c3c'
            : intent.type === 'Charge' && enemy.chargeCounter === 0 ? '#e74c3c'
            : intent.type === 'StrainTick' ? '#e67e22' : '#aaa',
        }}>
          {intent.type === 'Attack' || intent.type === 'AttackDebuff'
            ? `\u2694\uFE0F ${intent.value}${intent.hits && intent.hits > 1 ? ` \u00d7${intent.hits}` : ''}`
            : intent.type === 'Block' ? `\uD83D\uDEE1\uFE0F ${intent.value}`
            : intent.type === 'Retaliate' ? `\u2694\uFE0F ${intent.valuePerPush ?? intent.value} \u00d7 pushes`
            : intent.type === 'StrainScale' ? `\u2694\uFE0F ${intent.value} (+strain)`
            : intent.type === 'CopyAction' ? '\uD83E\uDE9E Mirrors you'
            : intent.type === 'Charge' ? (
              enemy.chargeCounter != null && enemy.chargeCounter > 0
                ? `\u26A1 Charging... ${enemy.chargeCounter}`
                : `\uD83D\uDCA5 BLAST ${intent.blastValue ?? intent.value}`
            )
            : intent.type === 'ConditionalBuff' ? `\u2B06\uFE0F +${intent.statusStacks ?? intent.value} Str if undamaged`
            : intent.type === 'Leech' ? `\uD83E\uDE78 ${intent.value} (heals self)`
            : intent.type === 'StrainTick' ? `\uD83D\uDE30 +${intent.value} strain/turn`
            : intent.type === 'Enrage' ? `\uD83D\uDD25 ${intent.value}${enemy.enrageStacks ? ` +${enemy.enrageStacks}` : ''}`
            : intent.type === 'ShieldAllies' ? `\uD83D\uDEE1\uFE0F +${intent.value} to allies`
            : intent.type === 'BerserkerAttack' ? `\u2694\uFE0F ${intent.value}${enemy.currentHealth < enemy.maxHealth * 0.5 ? ' (ENRAGED)' : ''}`
            : intent.type === 'PhaseShift' ? `${enemy.isPhased ? '\uD83D\uDD35 Armored' : '\uD83D\uDD34 Vulnerable'} \u2694\uFE0F ${intent.value}`
            : intent.type === 'StealBlock' ? '\uD83D\uDD12 Steals your block'
            : intent.type === 'MartyrHeal' ? `\u2694\uFE0F ${intent.value} (heals allies on death)`
            : intent.type}
        </div>
      )}
    </div>
  )
}

// ─── Combat Log ──────────────────────────────────────────────────────────

function CombatLog({ log }: { log: StrainCombatEvent[] }) {
  if (!log || log.length === 0) return null
  return (
    <div style={{
      background: '#0d0d1a', border: '1px solid #333', borderRadius: 6,
      padding: 8, maxHeight: 120, overflowY: 'auto', fontSize: 12, color: '#aaa', margin: '8px 0',
    }}>
      {log.map((event, i) => (
        <div key={i} style={{ marginBottom: 2 }}>
          {event.type === 'slotFire' && event.damage != null && (
            <span>{event.slotLabel} deals <span style={{ color: '#e74c3c' }}>{event.damage} damage</span></span>
          )}
          {event.type === 'slotFire' && event.block != null && (
            <span>{event.slotLabel} gains <span style={{ color: '#3498db' }}>{event.block} block</span></span>
          )}
          {event.type === 'slotFire' && event.heal != null && (
            <span>{event.slotLabel}: <span style={{ color: '#2ecc71' }}>heal {event.heal} HP</span></span>
          )}
          {event.type === 'slotFire' && event.strainChange != null && (
            <span>{event.slotLabel}: <span style={{ color: '#2ecc71' }}>{event.strainChange} strain</span></span>
          )}
          {event.type === 'synergy' && (
            <span style={{ color: '#f39c12' }}>{'✨'} {event.synergyName} activated</span>
          )}
          {event.type === 'enemyAction' && event.damage != null && (
            <span>
              {event.enemyName} attacks for <span style={{ color: '#e74c3c' }}>{event.damage}</span>
              {event.blocked ? <span style={{ color: '#3498db' }}> ({event.blocked} blocked)</span> : ''}
              {event.reduced ? <span style={{ color: '#e67e22' }}> ({event.reduced} reduced)</span> : ''}
            </span>
          )}
          {event.type === 'enemyAction' && event.block != null && !event.damage && (
            <span>{event.enemyName} gains {event.block} block</span>
          )}
          {event.type === 'enemyAction' && !event.damage && !event.block && (
            <span>{event.enemyName} uses {event.intentType}</span>
          )}
          {event.type === 'forfeit' && (
            <span style={{ color: '#e67e22' }}>You stopped.</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Slot Placement Screen ───────────────────────────────────────────────

function SlotPlacement({
  action,
  slotActions,
  onPlace,
  onCancel,
}: {
  action: ActionDefinition
  slotActions: (string | null)[]
  onPlace: (slotIndex: number) => void
  onCancel: () => void
}) {
  const pairLabels = ['Pair A', 'Pair A', 'Pair B', 'Pair B', 'Solo']

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
    }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
        Place: {action.name}
      </div>
      <div style={{ fontSize: 13, color: typeColor(action.type), marginBottom: 4 }}>{typeLabel(action.type)}</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>{action.description}</div>

      <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>Choose a slot to replace:</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 400 }}>
        {slotActions.map((existingId, i) => {
          const existing = existingId ? ALL_ACTIONS[existingId] : null
          const pairedIdx = i < 2 ? (i === 0 ? 1 : 0) : i < 4 ? (i === 2 ? 3 : 2) : -1
          const pairedAction = pairedIdx >= 0 ? slotActions[pairedIdx] : null
          const synergy = pairedAction ? getSynergyForPair(action.id, pairedAction) : null

          return (
            <button
              key={i}
              onClick={() => onPlace(i)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: '#1a1a2e', border: '2px solid #444',
                borderRadius: 8, color: '#fff', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#888' }}>{pairLabels[i]} {'·'} Slot {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {existing ? `Replace ${existing.name}` : 'Fill empty slot'}
                </div>
                {synergy && (
                  <div style={{ fontSize: 11, color: '#f39c12', marginTop: 2 }}>
                    Synergy: {synergy.name} — {synergy.description}
                  </div>
                )}
                {!synergy && pairedIdx >= 0 && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>No synergy</div>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#636e72' }}>→</div>
            </button>
          )
        })}
      </div>

      <button
        onClick={onCancel}
        style={{
          marginTop: 16, padding: '10px 24px', background: '#2d3436',
          border: '1px solid #636e72', borderRadius: 6, color: '#aaa',
          cursor: 'pointer', fontSize: 13,
        }}
      >
        Cancel
      </button>
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────

export default function StrainCombatScreen() {
  const navigate = useNavigate()
  const run = useRunStore()
  const [runVictory, setRunVictory] = useState(false)
  const [pendingGrowth, setPendingGrowth] = useState<{ action: ActionDefinition; cost: number } | null>(null)
  const growthOffersRef = useRef<ActionDefinition[] | null>(null)
  const sc = run.strainCombat

  // S3 victory screen
  if (runVictory) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
      }}>
        <div style={{ fontSize: 32, fontWeight: 300, marginBottom: 16, color: '#2ecc71' }}>You made it.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Strain: {run.strain} / 20</div>
        <button
          onClick={() => { useRunStore.getState().endRun(); navigate('/') }}
          style={{
            padding: '12px 32px', background: '#2d3436', border: '1px solid #2ecc7144',
            borderRadius: 6, color: '#2ecc71', fontSize: 16, cursor: 'pointer',
          }}
        >Home</button>
      </div>
    )
  }

  if (!sc) return null

  const projected = projectedStrain(sc)
  const willForfeit = wouldForfeit(sc)
  const isPlanning = sc.phase === 'planning'
  const strainCost = projectedStrainCost(sc)

  const endStrainCombat = (clearRoom: boolean) => {
    useRunStore.setState((s) => {
      const next = { ...s, strainCombat: null }
      next.strain = Math.max(0, s.strain - STRAIN_DECAY_BETWEEN_COMBATS)
      if (clearRoom) next.combatsCleared = s.combatsCleared + 1
      return next
    })
    if (clearRoom) {
      const state = useRunStore.getState()
      state.clearCurrentRoom()
      if (state.map) {
        const tile = state.map.grid[state.map.playerY][state.map.playerX]
        if (tile?.type === 'Boss') {
          if (state.sector < 3) {
            state.advanceSector()
          } else {
            setRunVictory(true)
          }
        }
      }
    }
    growthOffersRef.current = null
    setPendingGrowth(null)
    useRunStore.getState().saveRun()
  }

  // Forfeit screen
  if (sc.phase === 'forfeit') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#636e72' }}>You stopped.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          No rewards. Strain drops to {sc.strain}, then decays by {STRAIN_DECAY_BETWEEN_COMBATS}.
        </div>
        <button
          onClick={() => endStrainCombat(false)}
          style={{
            padding: '12px 32px', background: '#2d3436', border: '1px solid #636e72',
            borderRadius: 6, color: '#dfe6e9', fontSize: 16, cursor: 'pointer',
          }}
        >Continue</button>
      </div>
    )
  }

  // Slot placement screen (after choosing a growth action)
  if (pendingGrowth) {
    return (
      <SlotPlacement
        action={pendingGrowth.action}
        slotActions={[...sc.slotActions]}
        onPlace={(slotIndex) => {
          run.applyGrowthAction(pendingGrowth.action.id, slotIndex, pendingGrowth.cost)
          setPendingGrowth(null)
          endStrainCombat(true)
        }}
        onCancel={() => setPendingGrowth(null)}
      />
    )
  }

  // Reward screen
  if (sc.phase === 'reward') {
    if (!growthOffersRef.current) {
      growthOffersRef.current = getGrowthOffers(run.acquiredActions)
    }
    const growthOffers = growthOffersRef.current
    const comfort = getComfortReward(run.health, run.maxHealth, run.strain)

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 8, color: '#dfe6e9' }}>Still standing.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          Strain: {run.strain} / 20 | HP: {run.health} / {run.maxHealth}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {growthOffers.map(action => {
            const cost = action.takeCost ?? 3
            const tooExpensive = run.strain + cost >= 20
            return (
              <button
                key={action.id}
                onClick={() => !tooExpensive && setPendingGrowth({ action, cost })}
                disabled={tooExpensive}
                style={{
                  width: 150, padding: 14, background: tooExpensive ? '#111' : '#1a2a1a',
                  border: tooExpensive ? '2px solid #333' : '2px solid #e67e22',
                  borderRadius: 8, color: tooExpensive ? '#555' : '#fff',
                  cursor: tooExpensive ? 'default' : 'pointer', textAlign: 'center',
                  opacity: tooExpensive ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: 11, color: '#e67e22', marginBottom: 6, fontWeight: 600 }}>GROWTH</div>
                <div style={{ fontSize: 11, color: typeColor(action.type), marginBottom: 4 }}>{typeLabel(action.type)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{action.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {action.baseValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''} / {action.pushedValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>{action.description}</div>
                <div style={{ fontSize: 13, color: tooExpensive ? '#555' : '#e67e22' }}>
                  +{cost} strain → {run.strain + cost}
                </div>
              </button>
            )
          })}

          {/* Comfort */}
          <button
            onClick={() => { run.applyComfortReward(comfort.id); endStrainCombat(true) }}
            style={{
              width: 150, padding: 14, background: '#1a1a2e', border: '2px solid #636e72',
              borderRadius: 8, color: '#fff', cursor: 'pointer', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#636e72', marginBottom: 8, fontWeight: 600 }}>COMFORT</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{comfort.label}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>{comfort.description}</div>
            <div style={{ fontSize: 13, color: '#2ecc71' }}>free</div>
          </button>
        </div>
      </div>
    )
  }

  // Death
  if (sc.phase === 'finished') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#e74c3c' }}>Shutdown.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>HP reached 0.</div>
        <button
          onClick={() => { useRunStore.getState().endRun(); navigate('/') }}
          style={{
            padding: '12px 32px', background: '#2d3436', border: '1px solid #e74c3c44',
            borderRadius: 6, color: '#e74c3c', fontSize: 16, cursor: 'pointer',
          }}
        >End Run</button>
      </div>
    )
  }

  // ─── Planning / Combat UI ──────────────────────────────────────────

  // Check if Vent exists in any slot
  const hasVent = sc.slotActions.some(id => id && ALL_ACTIONS[id]?.isVent)

  // Count pushes and links for cost breakdown
  const pushCount = sc.pushedSlots.filter((p, i) => p && sc.slotActions[i]).length
  const linkCount = (sc.pushedSlots[0] && sc.pushedSlots[1] && sc.pairASynergy ? 1 : 0)
    + (sc.pushedSlots[2] && sc.pushedSlots[3] && sc.pairBSynergy ? 1 : 0)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0d0d1a', color: '#fff', padding: 16,
      overflow: 'auto',
    }}>
      {/* Header: HP + Strain */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#aaa' }}>
          <span>HP: {run.health} / {run.maxHealth}</span>
          <span>Block: {sc.block}</span>
          <span>Round {sc.roundNumber}</span>
        </div>
        <StrainMeter current={sc.strain} projected={projected} max={sc.maxStrain} />
      </div>

      {/* Enemies */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {sc.enemies.filter(e => !e.isDefeated).map(enemy => (
          <EnemyDisplay
            key={enemy.instanceId}
            enemy={enemy}
            selected={enemy.instanceId === sc.selectedTargetId}
            onClick={isPlanning ? () => run.selectStrainTarget(enemy.instanceId) : undefined}
          />
        ))}
      </div>

      {/* Combat Log */}
      <CombatLog log={sc.combatLog} />

      {/* Action Slots */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>

        {/* Pair A */}
        <div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
            <ActionSlot
              actionId={sc.slotActions[0]}
              pushed={!sc.ventActive && sc.pushedSlots[0]}
              onToggle={() => run.toggleSlotPush(0)}
              disabled={!isPlanning || sc.ventActive}
              bonusValue={sc.secondWindBonus}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 28, fontSize: 10, color: '#444',
            }}>
              {sc.pushedSlots[0] && sc.pushedSlots[1] && sc.pairASynergy && !sc.ventActive
                ? <span style={{ color: '#f39c12', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    {sc.pairASynergy.name}
                  </span>
                : '\u2500\u2500'
              }
            </div>
            <ActionSlot
              actionId={sc.slotActions[1]}
              pushed={!sc.ventActive && sc.pushedSlots[1]}
              onToggle={() => run.toggleSlotPush(1)}
              disabled={!isPlanning || sc.ventActive}
              bonusValue={sc.secondWindBonus}
            />
          </div>
          {sc.pushedSlots[0] && sc.pushedSlots[1] && sc.pairASynergy && !sc.ventActive && (
            <div style={{ fontSize: 11, color: '#f39c12', textAlign: 'center', marginTop: 3, opacity: 0.8 }}>
              {sc.pairASynergy.description} (+1 link tax)
            </div>
          )}
        </div>

        {/* Pair B */}
        <div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
            <ActionSlot
              actionId={sc.slotActions[2]}
              pushed={!sc.ventActive && sc.pushedSlots[2]}
              onToggle={() => run.toggleSlotPush(2)}
              disabled={!isPlanning || sc.ventActive}
              bonusValue={sc.secondWindBonus}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 28, fontSize: 10, color: '#444',
            }}>
              {sc.pushedSlots[2] && sc.pushedSlots[3] && sc.pairBSynergy && !sc.ventActive
                ? <span style={{ color: '#f39c12', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    {sc.pairBSynergy.name}
                  </span>
                : '\u2500\u2500'
              }
            </div>
            <ActionSlot
              actionId={sc.slotActions[3]}
              pushed={!sc.ventActive && sc.pushedSlots[3]}
              onToggle={() => run.toggleSlotPush(3)}
              disabled={!isPlanning || sc.ventActive}
              bonusValue={sc.secondWindBonus}
            />
          </div>
          {sc.pushedSlots[2] && sc.pushedSlots[3] && sc.pairBSynergy && !sc.ventActive && (
            <div style={{ fontSize: 11, color: '#f39c12', textAlign: 'center', marginTop: 3, opacity: 0.8 }}>
              {sc.pairBSynergy.description} (+1 link tax)
            </div>
          )}
        </div>

        {/* Solo */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ flex: 1, maxWidth: '40%' }}>
            <ActionSlot
              actionId={sc.slotActions[4]}
              pushed={!sc.ventActive && sc.pushedSlots[4]}
              onToggle={() => run.toggleSlotPush(4)}
              disabled={!isPlanning || sc.ventActive}
              bonusValue={sc.secondWindBonus}
            />
          </div>
        </div>
      </div>

      {/* Vent Toggle */}
      {hasVent && isPlanning && (
        <button
          onClick={() => run.toggleVent()}
          style={{
            padding: '10px 16px', margin: '8px 0',
            background: sc.ventActive ? '#1a3a2a' : '#1a1a2e',
            border: sc.ventActive ? '2px solid #2ecc71' : '2px solid #444',
            borderRadius: 6, color: sc.ventActive ? '#2ecc71' : '#aaa',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          {sc.ventActive ? `VENTING (\u2212${VENT_STRAIN_RECOVERY} strain)` : `Vent (\u2212${VENT_STRAIN_RECOVERY} strain)`}
        </button>
      )}

      {/* Strain Cost Breakdown */}
      {isPlanning && !sc.ventActive && (pushCount > 0 || linkCount > 0) && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#aaa', margin: '4px 0' }}>
          +{strainCost} strain ({pushCount} push{pushCount !== 1 ? 'es' : ''}{linkCount > 0 ? ` + ${linkCount} link${linkCount !== 1 ? 's' : ''}` : ''})
        </div>
      )}

      {/* Forfeit Warning */}
      {willForfeit && isPlanning && (
        <div style={{
          textAlign: 'center', color: '#e67e22', fontSize: 13,
          padding: 8, background: '#e67e2211', borderRadius: 6, margin: '4px 0',
        }}>
          Warning: Strain will reach {projected}. You will forfeit this fight.
        </div>
      )}

      {/* Execute Button */}
      {isPlanning && (
        <button
          onClick={() => run.executeStrainTurn()}
          style={{
            padding: '16px 0', marginTop: 8,
            background: willForfeit ? '#c0392b' : '#2d3436',
            border: willForfeit ? '2px solid #e74c3c' : '2px solid #636e72',
            borderRadius: 8, color: '#dfe6e9', fontSize: 18, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {willForfeit ? 'Push to Breaking Point' : 'Execute'}
        </button>
      )}
    </div>
  )
}
