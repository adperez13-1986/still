import { useRunStore } from '../store/runStore'
import { ALL_ENEMIES } from '../data/enemies'
import { STRAIN_SLOTS, STRAIN_DECAY_BETWEEN_COMBATS, VENT_STRAIN_RECOVERY, OVEREXTEND_PENALTY, getEnemyIntent, projectedStrain, wouldForfeit, isVenting, isOverextending, getAvailableAbilities, getAvailableGrowthRewards, pickComfortReward } from '../game/strainCombat'
import type { StrainSlot, StrainCombatEvent } from '../game/strainCombat'
import type { EnemyInstance } from '../game/types'

// ─── Strain Meter ────────────────────────────────────────────────────────

function StrainMeter({ current, projected, max }: { current: number; projected: number; max: number }) {
  const pct = (current / max) * 100
  const projPct = (projected / max) * 100

  // Color shifts as strain rises
  const barColor = current <= 7 ? '#636e72' : current <= 14 ? '#e67e22' : '#e74c3c'
  const projColor = projected >= max ? '#c0392b' : '#f39c12'

  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
        <span style={{ fontWeight: 600 }}>STRAIN</span>
        <span>
          {current}{projected > current ? ` → ${projected}` : ''} / {max}
        </span>
      </div>
      <div style={{
        height: 20,
        background: '#2d3436',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Projected strain (lighter, behind) */}
        {projected > current && (
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${projPct}%`,
            background: projColor,
            opacity: 0.4,
            transition: 'width 0.2s',
          }} />
        )}
        {/* Current strain */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: barColor,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

// ─── Slot Card ───────────────────────────────────────────────────────────

function SlotCard({ slot, pushed, onToggle, disabled, effectivePushCost }: {
  slot: StrainSlot
  pushed: boolean
  onToggle: () => void
  disabled: boolean
  effectivePushCost: number
}) {
  const value = pushed ? slot.pushedValue : slot.baseValue
  const typeLabel = slot.type === 'damage_single' ? 'DMG'
    : slot.type === 'block' ? 'BLK'
    : 'DMG ALL'

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '16px 12px',
        background: pushed ? '#2d3436' : '#1a1a2e',
        border: pushed ? '2px solid #e67e22' : '2px solid #444',
        borderRadius: 8,
        color: '#fff',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'center',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>{slot.label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: pushed ? '#e67e22' : '#dfe6e9' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{typeLabel}</div>
      {pushed && (
        <div style={{ fontSize: 11, color: effectivePushCost === 0 ? '#2ecc71' : '#e67e22', marginTop: 6 }}>
          {effectivePushCost === 0 ? 'MASTERED (free)' : `PUSHED (+${effectivePushCost} strain)`}
        </div>
      )}
      {!pushed && (
        <div style={{ fontSize: 11, color: '#636e72', marginTop: 6 }}>
          {effectivePushCost === 0 ? 'tap to push (free)' : 'tap to push'}
        </div>
      )}
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
        borderRadius: 8,
        padding: 12,
        minWidth: 120,
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{def.name}</div>
      {/* HP bar */}
      <div style={{ height: 8, background: '#2d3436', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${hpPct}%`, background: '#e74c3c', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
        {enemy.currentHealth} / {enemy.maxHealth} HP
        {enemy.block > 0 && <span style={{ color: '#3498db' }}> | {enemy.block} BLK</span>}
      </div>
      {/* Intent */}
      {intent && (
        <div style={{
          fontSize: 13,
          padding: '4px 8px',
          background: intent.type === 'Attack' || intent.type === 'AttackDebuff' ? '#c0392b33' : '#2d3436',
          borderRadius: 4,
          color: intent.type === 'Attack' || intent.type === 'AttackDebuff' ? '#e74c3c' : '#aaa',
        }}>
          {intent.type === 'Attack' || intent.type === 'AttackDebuff'
            ? `⚔️ ${intent.value}${intent.hits && intent.hits > 1 ? ` ×${intent.hits}` : ''}`
            : intent.type === 'Block' ? `🛡️ ${intent.value}`
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
      background: '#0d0d1a',
      border: '1px solid #333',
      borderRadius: 6,
      padding: 8,
      maxHeight: 120,
      overflowY: 'auto',
      fontSize: 12,
      color: '#aaa',
      margin: '8px 0',
    }}>
      {log.map((event, i) => (
        <div key={i} style={{ marginBottom: 2 }}>
          {event.type === 'slotFire' && event.damage != null && (
            <span>{event.slotLabel} deals <span style={{ color: '#e74c3c' }}>{event.damage} damage</span></span>
          )}
          {event.type === 'slotFire' && event.block != null && (
            <span>{event.slotLabel} gains <span style={{ color: '#3498db' }}>{event.block} block</span></span>
          )}
          {event.type === 'ability' && event.heal != null && (
            <span>{event.abilityLabel}: <span style={{ color: '#2ecc71' }}>heal {event.heal} HP</span></span>
          )}
          {event.type === 'ability' && !event.heal && (
            <span>{event.abilityLabel} active</span>
          )}
          {event.type === 'enemyAction' && event.damage != null && (
            <span>
              {event.enemyName} attacks for <span style={{ color: '#e74c3c' }}>{event.damage}</span>
              {event.blocked ? <span style={{ color: '#3498db' }}> ({event.blocked} blocked)</span> : ''}
              {event.reduced ? <span style={{ color: '#e67e22' }}> ({event.reduced} reduced)</span> : ''}
            </span>
          )}
          {event.type === 'enemyAction' && event.block != null && (
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

// ─── Main Screen ─────────────────────────────────────────────────────────

export default function StrainCombatScreen() {
  const run = useRunStore()
  const sc = run.strainCombat
  if (!sc) return null

  const projected = projectedStrain(sc)
  const willForfeit = wouldForfeit(sc)
  const isPlanning = sc.phase === 'planning'

  const endStrainCombat = (clearRoom: boolean) => {
    useRunStore.setState((s) => {
      const next = { ...s, strainCombat: null }
      // Passive strain decay between combats
      next.strain = Math.max(0, s.strain - STRAIN_DECAY_BETWEEN_COMBATS)
      if (clearRoom) next.combatsCleared = s.combatsCleared + 1
      return next
    })
    if (clearRoom) {
      const state = useRunStore.getState()
      state.clearCurrentRoom()
      // Check if this was the boss — advance sector
      if (state.map) {
        const tile = state.map.grid[state.map.playerY][state.map.playerX]
        if (tile?.type === 'Boss' && state.sector < 3) {
          state.advanceSector()
        }
      }
    }
    useRunStore.getState().saveRun()
  }

  // Forfeit screen
  if (sc.phase === 'forfeit') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff',
        padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#636e72' }}>
          You stopped.
        </div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          No rewards. Strain drops to {sc.strain}, then decays by {STRAIN_DECAY_BETWEEN_COMBATS}.
        </div>
        <button
          onClick={() => endStrainCombat(false)}
          style={{
            padding: '12px 32px', background: '#2d3436', border: '1px solid #636e72',
            borderRadius: 6, color: '#dfe6e9', fontSize: 16, cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    )
  }

  // Reward choice screen
  if (sc.phase === 'reward') {
    const availableGrowth = getAvailableGrowthRewards(run.growth, run.strain)
    // Show up to 3 growth options, lowest tier first
    const growthOptions = [...availableGrowth]
      .sort((a, b) => a.tier - b.tier)
      .slice(0, 3)
    const comfortReward = pickComfortReward(run.health, run.maxHealth, run.strain)

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff',
        padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 8, color: '#dfe6e9' }}>
          Still standing.
        </div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          Strain: {run.strain} / 20 | HP: {run.health} / {run.maxHealth}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Growth rewards */}
          {growthOptions.map(gr => (
            <button
              key={gr.id}
              onClick={() => {
                run.applyGrowthReward(gr.id, gr.strainCost)
                endStrainCombat(true)
              }}
              style={{
                width: 160, padding: 16,
                background: '#1a2a1a',
                border: '2px solid #e67e22',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 11, color: '#e67e22', marginBottom: 8, fontWeight: 600 }}>GROWTH{gr.tier > 1 ? ` · T${gr.tier} · ${gr.branch}` : ''}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{gr.label}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>{gr.description}</div>
              <div style={{ fontSize: 13, color: '#e67e22' }}>
                +{gr.strainCost} strain → {run.strain + gr.strainCost}
              </div>
            </button>
          ))}

          {/* Comfort reward */}
          <button
            onClick={() => {
              run.applyComfortReward(comfortReward.id)
              endStrainCombat(true)
            }}
            style={{
              width: 180, padding: 20,
              background: '#1a1a2e',
              border: '2px solid #636e72',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#636e72', marginBottom: 8, fontWeight: 600 }}>COMFORT</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{comfortReward.label}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>{comfortReward.description}</div>
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
        justifyContent: 'center', height: '100vh', background: '#0d0d1a', color: '#fff',
        padding: 24,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 16, color: '#e74c3c' }}>
          Shutdown.
        </div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          HP reached 0.
        </div>
        <button
          onClick={() => {
            useRunStore.setState((s) => ({
              ...s,
              strainCombat: null,
              active: false,
            }))
          }}
          style={{
            padding: '12px 32px', background: '#2d3436', border: '1px solid #e74c3c44',
            borderRadius: 6, color: '#e74c3c', fontSize: 16, cursor: 'pointer',
          }}
        >
          End Run
        </button>
      </div>
    )
  }

  // ─── Planning / Combat UI ──────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0d0d1a', color: '#fff',
      padding: 16,
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
      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: 16,
      }}>
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

      {/* Slots */}
      <div style={{
        display: 'flex', gap: 12,
        flex: 1, alignItems: 'center',
      }}>
        {STRAIN_SLOTS.map(slot => {
          const venting = isVenting(sc)
          return (
            <SlotCard
              key={slot.id}
              slot={slot}
              pushed={!venting && sc.pushedSlots[slot.id]}
              onToggle={() => run.toggleStrainPush(slot.id)}
              disabled={!isPlanning || venting}
              effectivePushCost={sc.pushCosts[slot.id]}
            />
          )
        })}
      </div>

      {/* Abilities */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0',
      }}>
        {getAvailableAbilities(run.growth).map(ability => {
          const active = sc.activeAbilities.includes(ability.id)
          return (
            <button
              key={ability.id}
              onClick={() => run.toggleStrainAbility(ability.id)}
              disabled={!isPlanning}
              style={{
                padding: '10px 16px',
                background: active ? '#1a3a2a' : '#1a1a2e',
                border: active ? '2px solid #2ecc71' : '2px solid #444',
                borderRadius: 6,
                color: active ? '#2ecc71' : '#aaa',
                cursor: isPlanning ? 'pointer' : 'default',
                opacity: isPlanning ? 1 : 0.5,
                fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontWeight: 600 }}>{ability.label}</span>
              <span style={{ color: '#888', marginLeft: 6 }}>
                {ability.id === 'vent' ? `(−${VENT_STRAIN_RECOVERY} strain)` : `(${ability.strainCost} strain)`}
              </span>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{ability.description}</div>
            </button>
          )
        })}
      </div>

      {/* Overextend Warning */}
      {isOverextending(sc) && isPlanning && !willForfeit && (
        <div style={{
          textAlign: 'center', color: '#f39c12', fontSize: 13,
          padding: 8, background: '#f39c1211', borderRadius: 6, margin: '8px 0',
        }}>
          Overextending: +{OVEREXTEND_PENALTY} strain for using all actions
        </div>
      )}

      {/* Forfeit Warning */}
      {willForfeit && isPlanning && (
        <div style={{
          textAlign: 'center', color: '#e67e22', fontSize: 13,
          padding: 8, background: '#e67e2211', borderRadius: 6, margin: '8px 0',
        }}>
          Warning: This will push strain to {projected}. You will forfeit this fight.
        </div>
      )}

      {/* Execute Button */}
      {isPlanning && (
        <button
          onClick={() => run.executeStrainTurn()}
          style={{
            padding: '16px 0',
            background: willForfeit ? '#c0392b' : '#2d3436',
            border: willForfeit ? '2px solid #e74c3c' : '2px solid #636e72',
            borderRadius: 8,
            color: '#dfe6e9',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          {willForfeit ? 'Push to Breaking Point' : 'Execute'}
        </button>
      )}
    </div>
  )
}
