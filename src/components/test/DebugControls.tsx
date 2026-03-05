import { useState } from 'react'
import type { CombatState, StatusEffectType } from '../../game/types'
import { BODY_SLOTS, HEAT_MAX } from '../../game/types'
import { ALL_CARDS } from '../../data/cards'

type TurnStep = 'planning' | 'body_done' | 'enemy_done' | 'end_done'

interface DebugControlsProps {
  combat: CombatState | null
  stillHealth: number
  maxHealth: number
  dispatch: React.Dispatch<any>
  onAutoComplete: () => void
  onReset: () => void
  turnStep: TurnStep
}

const btnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: 'var(--bg-surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--muted)',
  marginTop: 8,
  marginBottom: 4,
}

const ALL_STATUSES: StatusEffectType[] = ['Weak', 'Vulnerable', 'Strength', 'Dexterity', 'Inspired']

export default function DebugControls({
  combat,
  stillHealth,
  maxHealth,
  dispatch,
  onAutoComplete,
  onReset,
  turnStep,
}: DebugControlsProps) {
  const [addCardId, setAddCardId] = useState(Object.keys(ALL_CARDS)[0] ?? '')
  const [selectedEnemyId, setSelectedEnemyId] = useState('')

  if (!combat) return null

  const enemies = combat.enemies.filter(e => !e.isDefeated)
  const currentEnemyId = selectedEnemyId || enemies[0]?.instanceId || ''

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 12,
      maxHeight: 300,
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Debug Controls</div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <button
          onClick={onAutoComplete}
          disabled={turnStep !== 'planning'}
          style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', opacity: turnStep === 'planning' ? 1 : 0.4 }}
        >
          Auto-Complete Turn
        </button>
        <button
          onClick={onReset}
          style={{ ...btnStyle, borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          Reset Combat
        </button>
      </div>

      {/* Still Health/Heat */}
      <div style={sectionLabelStyle}>Still</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 12, width: 40 }}>Heat:</span>
        <input
          type="range"
          min={0}
          max={HEAT_MAX}
          value={combat.heat}
          onChange={(e) => dispatch({ type: 'DEBUG_SET_HEAT', heat: Number(e.target.value) })}
          style={{ flex: 1, maxWidth: 120 }}
        />
        <span style={{ fontSize: 12, fontFamily: 'monospace', width: 20 }}>{combat.heat}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 12, width: 40 }}>HP:</span>
        <input
          type="range"
          min={0}
          max={maxHealth}
          value={stillHealth}
          onChange={(e) => dispatch({ type: 'DEBUG_SET_HEALTH', health: Number(e.target.value) })}
          style={{ flex: 1, maxWidth: 120 }}
        />
        <span style={{ fontSize: 12, fontFamily: 'monospace', width: 20 }}>{stillHealth}</span>
      </div>

      {/* Toggle shutdown */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <button
          onClick={() => dispatch({ type: 'DEBUG_TOGGLE_SHUTDOWN' })}
          style={{
            ...btnStyle,
            background: combat.shutdown ? 'var(--danger)' : 'var(--bg-surface)',
            color: combat.shutdown ? '#fff' : 'var(--text)',
          }}
        >
          Shutdown: {combat.shutdown ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Disabled slots */}
      <div style={sectionLabelStyle}>Disabled Slots</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {BODY_SLOTS.map(slot => {
          const isDisabled = combat.disabledSlots.includes(slot)
          return (
            <button
              key={slot}
              onClick={() => dispatch({ type: 'DEBUG_TOGGLE_DISABLED_SLOT', slot })}
              style={{
                ...btnStyle,
                background: isDisabled ? 'var(--danger)' : 'var(--bg-surface)',
                color: isDisabled ? '#fff' : 'var(--text)',
                fontSize: 11,
              }}
            >
              {slot}
            </button>
          )
        })}
      </div>

      {/* Status effects */}
      <div style={sectionLabelStyle}>Still Status Effects</div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
        {ALL_STATUSES.map(status => {
          const has = combat.statusEffects.some(s => s.type === status)
          return (
            <button
              key={status}
              onClick={() => {
                if (has) {
                  dispatch({ type: 'DEBUG_REMOVE_STATUS', statusType: status })
                } else {
                  dispatch({ type: 'DEBUG_ADD_STATUS', status: { type: status, stacks: 2 } })
                }
              }}
              style={{
                ...btnStyle,
                fontSize: 10,
                background: has ? 'rgba(162,155,254,0.2)' : 'var(--bg-surface)',
                color: has ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {has ? '-' : '+'} {status}
            </button>
          )
        })}
      </div>

      {/* Add card to hand */}
      <div style={sectionLabelStyle}>Add Card to Hand</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <select
          value={addCardId}
          onChange={(e) => setAddCardId(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--bg-surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '2px 4px',
            fontSize: 12,
          }}
        >
          {Object.values(ALL_CARDS).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => dispatch({ type: 'DEBUG_ADD_CARD_TO_HAND', definitionId: addCardId })}
          disabled={combat.hand.length >= 10}
          style={btnStyle}
        >
          Add
        </button>
      </div>

      {/* Enemy controls */}
      {enemies.length > 0 && (
        <>
          <div style={sectionLabelStyle}>Enemy Controls</div>
          <select
            value={currentEnemyId}
            onChange={(e) => setSelectedEnemyId(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 4px',
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            {combat.enemies.map(e => (
              <option key={e.instanceId} value={e.instanceId}>
                {e.definitionId} — HP {e.currentHealth}/{e.maxHealth} {e.isDefeated ? '(dead)' : ''}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, width: 30 }}>HP:</span>
            <input
              type="range"
              min={0}
              max={combat.enemies.find(e => e.instanceId === currentEnemyId)?.maxHealth ?? 100}
              value={combat.enemies.find(e => e.instanceId === currentEnemyId)?.currentHealth ?? 0}
              onChange={(e) => dispatch({
                type: 'DEBUG_SET_ENEMY_HEALTH',
                enemyId: currentEnemyId,
                health: Number(e.target.value),
              })}
              style={{ flex: 1, maxWidth: 120 }}
            />
            <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
              {combat.enemies.find(e => e.instanceId === currentEnemyId)?.currentHealth ?? 0}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, width: 60 }}>Intent:</span>
            <input
              type="number"
              min={0}
              value={combat.enemies.find(e => e.instanceId === currentEnemyId)?.intentIndex ?? 0}
              onChange={(e) => dispatch({
                type: 'DEBUG_SET_ENEMY_INTENT',
                enemyId: currentEnemyId,
                index: Number(e.target.value),
              })}
              style={{
                width: 50,
                background: 'var(--bg-surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 4px',
                fontSize: 12,
              }}
            />
          </div>

          {/* Enemy status effects */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(status => {
              const enemy = combat.enemies.find(e => e.instanceId === currentEnemyId)
              const has = enemy?.statusEffects.some(s => s.type === status)
              return (
                <button
                  key={status}
                  onClick={() => {
                    if (has) {
                      dispatch({ type: 'DEBUG_REMOVE_ENEMY_STATUS', enemyId: currentEnemyId, statusType: status })
                    } else {
                      dispatch({ type: 'DEBUG_ADD_ENEMY_STATUS', enemyId: currentEnemyId, status: { type: status, stacks: 2 } })
                    }
                  }}
                  style={{
                    ...btnStyle,
                    fontSize: 10,
                    background: has ? 'rgba(162,155,254,0.2)' : 'var(--bg-surface)',
                    color: has ? 'var(--accent)' : 'var(--muted)',
                  }}
                >
                  {has ? '-' : '+'} {status}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
