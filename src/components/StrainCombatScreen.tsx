import { useState, useRef, useEffect } from 'react'
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

function typeIcon(type: string): string {
  switch (type) {
    case 'damage_single': case 'damage_all': return '\u2694\uFE0F'
    case 'block': return '\uD83D\uDEE1\uFE0F'
    case 'heal': return '\uD83D\uDC9A'
    case 'reduce': return '\uD83D\uDEE1\uFE0F'
    case 'reflect': return '\uD83D\uDD01'
    case 'buff': return '\u2B06\uFE0F'
    case 'debuff': return '\u2B07\uFE0F'
    case 'convert': return '\u267B\uFE0F'
    case 'utility': return '\uD83C\uDFAF'
    case 'recovery': return '\uD83D\uDCA8'
    default: return '\u2B50'
  }
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
    case 'damage_single': case 'damage_all': return '#e74c3c'
    case 'block': case 'reduce': return '#3498db'
    case 'heal': return '#2ecc71'
    case 'reflect': return '#9b59b6'
    case 'buff': return '#f1c40f'
    case 'debuff': return '#e67e22'
    case 'convert': return '#1abc9c'
    case 'utility': return '#95a5a6'
    case 'recovery': return '#636e72'
    default: return '#aaa'
  }
}

// ─── Floating Number System ─────────────────────────────────────────────

interface FloatEntry {
  id: number
  text: string
  color: string
  delay: number
  target: 'player' | string // 'player' or enemyId
}

const FLOAT_STEP = 500

function buildFloats(log: StrainCombatEvent[]): FloatEntry[] {
  const floats: FloatEntry[] = []
  let delay = 0

  for (const event of log) {
    if (event.type === 'slotFire') {
      if (event.damage != null) {
        floats.push({ id: delay, text: `-${event.damage}`, color: '#e74c3c', delay, target: event.enemyId ?? 'player' })
        delay += FLOAT_STEP
      }
      if (event.block != null) {
        floats.push({ id: delay, text: `+${event.block}`, color: '#3498db', delay, target: 'player' })
        delay += FLOAT_STEP
      }
      if (event.heal != null) {
        floats.push({ id: delay, text: `+${event.heal}`, color: '#2ecc71', delay, target: 'player' })
        delay += FLOAT_STEP
      }
      if (event.strainChange != null) {
        floats.push({ id: delay, text: `${event.strainChange > 0 ? '+' : ''}${event.strainChange}`, color: event.strainChange < 0 ? '#2ecc71' : '#e67e22', delay, target: 'player' })
        delay += FLOAT_STEP
      }
    }
    if (event.type === 'synergy') {
      if (event.damage != null) {
        floats.push({ id: delay, text: `-${event.damage}`, color: '#f39c12', delay, target: event.enemyId ?? 'player' })
        delay += FLOAT_STEP
      } else if (event.heal != null) {
        floats.push({ id: delay, text: `+${event.heal}`, color: '#2ecc71', delay, target: 'player' })
        delay += FLOAT_STEP
      } else if (event.strainChange != null && event.strainChange < 0) {
        floats.push({ id: delay, text: `${event.strainChange}`, color: '#2ecc71', delay, target: 'player' })
        delay += FLOAT_STEP
      }
    }
    if (event.type === 'enemyAction') {
      if (event.damage != null && event.damage > 0) {
        floats.push({ id: delay, text: `-${event.damage}`, color: '#ff6b6b', delay, target: 'player' })
        delay += FLOAT_STEP
      } else if (event.damage === 0 && event.blocked) {
        floats.push({ id: delay, text: 'BLOCKED', color: '#3498db', delay, target: 'player' })
        delay += FLOAT_STEP
      }
    }
  }
  return floats
}

const FLOAT_STYLE = `
  @keyframes combatFloat {
    0% { opacity: 0; transform: translateY(4px); }
    15% { opacity: 1; transform: translateY(0); }
    60% { opacity: 1; transform: translateY(-20px); }
    100% { opacity: 0; transform: translateY(-32px); }
  }
`

function EntityFloats({ floats, targetId }: { floats: FloatEntry[]; targetId: string }) {
  const filtered = floats.filter(f => f.target === targetId)
  if (filtered.length === 0) return null
  return (
    <>
      {filtered.map(f => (
        <div key={f.id} style={{
          position: 'absolute', top: '50%', right: -2,
          color: f.color, fontWeight: 700, fontSize: 18,
          textShadow: '0 1px 4px rgba(0,0,0,0.9)', whiteSpace: 'nowrap',
          animation: `combatFloat 1s ease-out ${f.delay}ms both`,
          pointerEvents: 'none', zIndex: 10,
        }}>
          {f.text}
        </div>
      ))}
    </>
  )
}

// ─── Strain Meter ────────────────────────────────────────────────────────

function StrainMeter({ current, projected, max }: { current: number; projected: number; max: number }) {
  const pct = (current / max) * 100
  const projPct = (projected / max) * 100
  const barColor = current <= 7 ? '#636e72' : current <= 14 ? '#e67e22' : '#e74c3c'
  const projColor = projected >= max ? '#c0392b' : '#f39c12'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
        <span style={{ fontWeight: 600, letterSpacing: 1 }}>STRAIN</span>
        <span>{current}{projected !== current ? ` → ${projected}` : ''} / {max}</span>
      </div>
      <div style={{ height: 14, background: '#2d3436', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
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

// ─── Player Card ─────────────────────────────────────────────────────────

function PlayerCard({ health, maxHealth, block, floats }: {
  health: number; maxHealth: number; block: number; floats: FloatEntry[]
}) {
  const hpPct = (health / maxHealth) * 100
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid #555', borderRadius: 8,
      padding: '6px 14px 8px', position: 'relative', margin: '0 auto 4px', width: '80%', maxWidth: 300,
    }}>
      <div style={{ fontSize: 9, color: '#636e72', letterSpacing: 2, marginBottom: 3, textAlign: 'center' }}>STILL</div>
      <div style={{ height: 10, background: '#2d3436', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${hpPct}%`, background: health > maxHealth * 0.4 ? '#2ecc71' : '#e74c3c', transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#aaa' }}>
        <span>{health} / {maxHealth} HP</span>
        {block > 0 && <span style={{ color: '#3498db' }}>{'\uD83D\uDEE1\uFE0F'} {block}</span>}
      </div>
      <EntityFloats floats={floats} targetId="player" />
    </div>
  )
}

// ─── Enemy Card ──────────────────────────────────────────────────────────

function EnemyCard({ enemy, selected, onClick, floats }: {
  enemy: EnemyInstance; selected?: boolean; onClick?: () => void; floats: FloatEntry[]
}) {
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
        borderRadius: 8, padding: '8px 10px', minWidth: 110, textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default', position: 'relative',
      }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{def.name}</div>
      <div style={{ height: 6, background: '#2d3436', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
        <div style={{ height: '100%', width: `${hpPct}%`, background: '#e74c3c', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
        {enemy.currentHealth}/{enemy.maxHealth}
        {enemy.block > 0 && <span style={{ color: '#3498db' }}> {'\uD83D\uDEE1\uFE0F'}{enemy.block}</span>}
      </div>
      {intent && (
        <div style={{
          fontSize: 12, padding: '2px 6px', borderRadius: 3,
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
            : intent.type === 'CopyAction' ? '\uD83E\uDE9E Mirrors'
            : intent.type === 'Charge' ? (
              enemy.chargeCounter != null && enemy.chargeCounter > 0
                ? `\u26A1 ${enemy.chargeCounter}...`
                : `\uD83D\uDCA5 ${intent.blastValue ?? intent.value}`
            )
            : intent.type === 'ConditionalBuff' ? `\u2B06\uFE0F +${intent.statusStacks ?? intent.value} if safe`
            : intent.type === 'Leech' ? `\uD83E\uDE78 ${intent.value}`
            : intent.type === 'StrainTick' ? `+${intent.value} strain`
            : intent.type === 'Enrage' ? `\uD83D\uDD25 ${intent.value}${enemy.enrageStacks ? `+${enemy.enrageStacks}` : ''}`
            : intent.type === 'ShieldAllies' ? `\uD83D\uDEE1\uFE0F allies`
            : intent.type === 'BerserkerAttack' ? `\u2694\uFE0F ${intent.value}${enemy.currentHealth < enemy.maxHealth * 0.5 ? '!' : ''}`
            : intent.type === 'PhaseShift' ? `${enemy.isPhased ? '\uD83D\uDD35' : '\uD83D\uDD34'} ${intent.value}`
            : intent.type === 'StealBlock' ? '\uD83D\uDD12 steal'
            : intent.type === 'MartyrHeal' ? `\u2694\uFE0F ${intent.value}`
            : intent.type}
        </div>
      )}
      <EntityFloats floats={floats} targetId={enemy.instanceId} />
    </div>
  )
}

// ─── Compact Action Slot ─────────────────────────────────────────────────

function ActionSlot({
  actionId, pushed, onToggle, disabled, bonusValue,
}: {
  actionId: string | null; pushed: boolean; onToggle: () => void; disabled: boolean; bonusValue: number
}) {
  if (!actionId) {
    return (
      <div style={{
        flex: 1, padding: '6px 4px', background: '#1a1a2e', border: '2px solid #333',
        borderRadius: 6, textAlign: 'center', color: '#555', fontSize: 11,
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
        flex: 1, padding: '4px 4px 6px',
        background: pushed ? '#2d3436' : '#1a1a2e',
        border: pushed ? '2px solid #e67e22' : isVent ? '2px solid #636e72' : '2px solid #333',
        borderRadius: 6, color: '#fff',
        cursor: disabled || isVent ? 'default' : 'pointer',
        textAlign: 'center', transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: 10, color: '#888' }}>
        {typeIcon(action.type)} {action.name}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: pushed ? '#e67e22' : '#dfe6e9', lineHeight: 1.1 }}>
        {isVent ? `-${VENT_STRAIN_RECOVERY}` : displayValue}{action.hits && action.hits > 1 ? `\u00d7${action.hits}` : ''}
      </div>
    </button>
  )
}

// ─── Slot Placement Screen ───────────────────────────────────────────────

function SlotPlacement({
  action, slotActions, onPlace, onCancel,
}: {
  action: ActionDefinition; slotActions: (string | null)[]; onPlace: (slotIndex: number) => void; onCancel: () => void
}) {
  const pairLabels = ['Pair A', 'Pair A', 'Pair B', 'Pair B', 'Solo']

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24,
    }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Place: {action.name}</div>
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
            <button key={i} onClick={() => onPlace(i)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: '#1a1a2e', border: '2px solid #444',
              borderRadius: 8, color: '#fff', cursor: 'pointer', textAlign: 'left',
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#888' }}>{pairLabels[i]} {'·'} Slot {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{existing ? `Replace ${existing.name}` : 'Fill empty slot'}</div>
                {synergy && <div style={{ fontSize: 11, color: '#f39c12', marginTop: 2 }}>Synergy: {synergy.name} — {synergy.description}</div>}
                {!synergy && pairedIdx >= 0 && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>No synergy</div>}
              </div>
              <div style={{ fontSize: 12, color: '#636e72' }}>→</div>
            </button>
          )
        })}
      </div>
      <button onClick={onCancel} style={{
        marginTop: 16, padding: '10px 24px', background: '#2d3436',
        border: '1px solid #636e72', borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 13,
      }}>Cancel</button>
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
  const [floats, setFloats] = useState<FloatEntry[]>([])
  const lastAnimKey = useRef('')
  const sc = run.strainCombat

  // Combat animation
  const animKey = sc ? `${sc.roundNumber}-${sc.phase}` : ''
  useEffect(() => {
    if (!sc || animKey === lastAnimKey.current || sc.combatLog.length === 0) return
    lastAnimKey.current = animKey
    const newFloats = buildFloats(sc.combatLog)
    setFloats(newFloats)
    const maxDelay = newFloats.length * FLOAT_STEP
    const timer = setTimeout(() => setFloats([]), maxDelay + 1500)
    return () => clearTimeout(timer)
  }, [animKey])

  // S3 victory
  if (runVictory) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 300, marginBottom: 16, color: '#2ecc71' }}>You made it.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Strain: {run.strain} / 20</div>
        <button onClick={() => { useRunStore.getState().endRun(); navigate('/') }} style={{ padding: '12px 32px', background: '#2d3436', border: '1px solid #2ecc7144', borderRadius: 6, color: '#2ecc71', fontSize: 16, cursor: 'pointer' }}>Home</button>
      </div>
    )
  }

  if (!sc) return null

  const projected = projectedStrain(sc)
  const willForfeit = wouldForfeit(sc)
  const isPlanning = sc.phase === 'planning'
  const strainCost = projectedStrainCost(sc)
  const pushCount = sc.pushedSlots.filter((p, i) => p && sc.slotActions[i]).length

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
          if (state.sector < 3) state.advanceSector()
          else setRunVictory(true)
        }
      }
    }
    growthOffersRef.current = null
    setPendingGrowth(null)
    useRunStore.getState().saveRun()
  }

  // Forfeit
  if (sc.phase === 'forfeit') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#636e72' }}>You stopped.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>No rewards. Strain drops to {sc.strain}, then decays by {STRAIN_DECAY_BETWEEN_COMBATS}.</div>
        <button onClick={() => endStrainCombat(false)} style={{ padding: '12px 32px', background: '#2d3436', border: '1px solid #636e72', borderRadius: 6, color: '#dfe6e9', fontSize: 16, cursor: 'pointer' }}>Continue</button>
      </div>
    )
  }

  // Slot placement
  if (pendingGrowth) {
    return (
      <SlotPlacement
        action={pendingGrowth.action}
        slotActions={[...sc.slotActions]}
        onPlace={(slotIndex) => { run.applyGrowthAction(pendingGrowth.action.id, slotIndex, pendingGrowth.cost); setPendingGrowth(null); endStrainCombat(true) }}
        onCancel={() => setPendingGrowth(null)}
      />
    )
  }

  // Reward
  if (sc.phase === 'reward') {
    if (!growthOffersRef.current) growthOffersRef.current = getGrowthOffers(run.acquiredActions)
    const growthOffers = growthOffersRef.current
    const comfort = getComfortReward(run.health, run.maxHealth, run.strain)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 8, color: '#dfe6e9' }}>Still standing.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Strain: {run.strain} / 20 | HP: {run.health} / {run.maxHealth}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {growthOffers.map(action => {
            const cost = action.takeCost ?? 3
            const tooExpensive = run.strain + cost >= 20
            return (
              <button key={action.id} onClick={() => !tooExpensive && setPendingGrowth({ action, cost })} disabled={tooExpensive} style={{
                width: 150, padding: 14, background: tooExpensive ? '#111' : '#1a2a1a',
                border: tooExpensive ? '2px solid #333' : '2px solid #e67e22', borderRadius: 8,
                color: tooExpensive ? '#555' : '#fff', cursor: tooExpensive ? 'default' : 'pointer',
                textAlign: 'center', opacity: tooExpensive ? 0.5 : 1,
              }}>
                <div style={{ fontSize: 11, color: '#e67e22', marginBottom: 6, fontWeight: 600 }}>GROWTH</div>
                <div style={{ fontSize: 11, color: typeColor(action.type), marginBottom: 4 }}>{typeLabel(action.type)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{action.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {action.baseValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''} / {action.pushedValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>{action.description}</div>
                <div style={{ fontSize: 13, color: tooExpensive ? '#555' : '#e67e22' }}>+{cost} strain → {run.strain + cost}</div>
              </button>
            )
          })}
          <button onClick={() => { run.applyComfortReward(comfort.id); endStrainCombat(true) }} style={{
            width: 150, padding: 14, background: '#1a1a2e', border: '2px solid #636e72',
            borderRadius: 8, color: '#fff', cursor: 'pointer', textAlign: 'center',
          }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff', padding: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#e74c3c' }}>Shutdown.</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>HP reached 0.</div>
        <button onClick={() => { useRunStore.getState().endRun(); navigate('/') }} style={{ padding: '12px 32px', background: '#2d3436', border: '1px solid #e74c3c44', borderRadius: 6, color: '#e74c3c', fontSize: 16, cursor: 'pointer' }}>End Run</button>
      </div>
    )
  }

  // ─── Battlefield Layout ────────────────────────────────────────────

  const hasVent = sc.slotActions.some(id => id && ALL_ACTIONS[id]?.isVent)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0d0d1a', color: '#fff',
      padding: '12px 12px 8px',
    }}>
      <style>{FLOAT_STYLE}</style>

      {/* Strain Meter */}
      <StrainMeter current={sc.strain} projected={projected} max={sc.maxStrain} />

      {/* Enemy Zone */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
        {sc.enemies.filter(e => !e.isDefeated).map(enemy => (
          <EnemyCard
            key={enemy.instanceId}
            enemy={enemy}
            selected={enemy.instanceId === sc.selectedTargetId}
            onClick={isPlanning ? () => run.selectStrainTarget(enemy.instanceId) : undefined}
            floats={floats}
          />
        ))}
      </div>

      {/* Spacer pushes player + slots to bottom */}
      <div style={{ flex: 1 }} />

      {/* Player Card — anchored above action slots */}
      <PlayerCard health={run.health} maxHealth={run.maxHealth} block={sc.block} floats={floats} />

      {/* Action Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '6px 0' }}>
        {/* Pair A */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <ActionSlot actionId={sc.slotActions[0]} pushed={!sc.ventActive && sc.pushedSlots[0]} onToggle={() => run.toggleSlotPush(0)} disabled={!isPlanning || sc.ventActive} bonusValue={sc.secondWindBonus} />
          <div style={{ fontSize: 9, color: '#444', minWidth: 20, textAlign: 'center' }}>
            {sc.pushedSlots[0] && sc.pushedSlots[1] && sc.pairASynergy && !sc.ventActive
              ? <span style={{ color: '#f39c12', fontWeight: 600 }}>{sc.pairASynergy.name}</span>
              : '──'}
          </div>
          <ActionSlot actionId={sc.slotActions[1]} pushed={!sc.ventActive && sc.pushedSlots[1]} onToggle={() => run.toggleSlotPush(1)} disabled={!isPlanning || sc.ventActive} bonusValue={sc.secondWindBonus} />
        </div>

        {/* Pair B */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <ActionSlot actionId={sc.slotActions[2]} pushed={!sc.ventActive && sc.pushedSlots[2]} onToggle={() => run.toggleSlotPush(2)} disabled={!isPlanning || sc.ventActive} bonusValue={sc.secondWindBonus} />
          <div style={{ fontSize: 9, color: '#444', minWidth: 20, textAlign: 'center' }}>
            {sc.pushedSlots[2] && sc.pushedSlots[3] && sc.pairBSynergy && !sc.ventActive
              ? <span style={{ color: '#f39c12', fontWeight: 600 }}>{sc.pairBSynergy.name}</span>
              : '──'}
          </div>
          <ActionSlot actionId={sc.slotActions[3]} pushed={!sc.ventActive && sc.pushedSlots[3]} onToggle={() => run.toggleSlotPush(3)} disabled={!isPlanning || sc.ventActive} bonusValue={sc.secondWindBonus} />
        </div>

        {/* Solo */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '38%' }}>
            <ActionSlot actionId={sc.slotActions[4]} pushed={!sc.ventActive && sc.pushedSlots[4]} onToggle={() => run.toggleSlotPush(4)} disabled={!isPlanning || sc.ventActive} bonusValue={sc.secondWindBonus} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        {hasVent && isPlanning && (
          <button onClick={() => run.toggleVent()} style={{
            flex: 1, padding: '10px 0',
            background: sc.ventActive ? '#1a3a2a' : '#1a1a2e',
            border: sc.ventActive ? '2px solid #2ecc71' : '2px solid #444',
            borderRadius: 6, color: sc.ventActive ? '#2ecc71' : '#aaa',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            {sc.ventActive ? `VENTING -${VENT_STRAIN_RECOVERY}` : `Vent -${VENT_STRAIN_RECOVERY}`}
          </button>
        )}
        {isPlanning && (
          <button onClick={() => run.executeStrainTurn()} style={{
            flex: 2, padding: '10px 0',
            background: willForfeit ? '#c0392b' : '#2d3436',
            border: willForfeit ? '2px solid #e74c3c' : '2px solid #636e72',
            borderRadius: 6, color: '#dfe6e9', fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            {willForfeit ? 'Breaking Point' : pushCount > 0 ? `Execute +${strainCost}` : 'Execute'}
          </button>
        )}
      </div>

      {/* Forfeit Warning */}
      {willForfeit && isPlanning && (
        <div style={{ textAlign: 'center', color: '#e67e22', fontSize: 11, padding: 4, marginTop: 4 }}>
          Strain will reach {projected} — you will forfeit
        </div>
      )}
    </div>
  )
}
