import type { ScenarioConfig } from './TestHarness'
import type { BodySlot, EquipmentDefinition, BehavioralPartDefinition } from '../../game/types'
import { BODY_SLOTS } from '../../game/types'
import { EQUIPMENT, BEHAVIORAL_PARTS } from '../../data/parts'
import { ALL_CARDS } from '../../data/cards'
import { SECTOR1_ENEMIES, SECTOR1_ELITES, SECTOR1_BOSS } from '../../data/enemies'

interface ScenarioBuilderProps {
  scenario: ScenarioConfig
  onChange: (s: ScenarioConfig) => void
  onStart: () => void
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
}

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  marginBottom: 8,
  display: 'block',
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 13,
}

const smallBtnStyle: React.CSSProperties = {
  padding: '2px 8px',
  background: 'var(--bg-surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}

export default function ScenarioBuilder({ scenario, onChange, onStart }: ScenarioBuilderProps) {
  const equipmentBySlot = (slot: BodySlot): EquipmentDefinition[] =>
    EQUIPMENT.filter(e => e.slot === slot)

  const allEnemyDefs = [...SECTOR1_ENEMIES, ...SECTOR1_ELITES, SECTOR1_BOSS]
  const allCardDefs = Object.values(ALL_CARDS)

  const setEquipment = (slot: BodySlot, id: string | null) => {
    const equip = id ? EQUIPMENT.find(e => e.id === id) ?? null : null
    onChange({ ...scenario, equipment: { ...scenario.equipment, [slot]: equip } })
  }

  const setEnemyAtIndex = (index: number, id: string) => {
    const def = allEnemyDefs.find(e => e.id === id)
    if (!def) return
    const enemies = [...scenario.enemies]
    enemies[index] = def
    onChange({ ...scenario, enemies })
  }

  const addEnemy = () => {
    if (scenario.enemies.length >= 3) return
    onChange({ ...scenario, enemies: [...scenario.enemies, SECTOR1_ENEMIES[0]] })
  }

  const removeEnemy = (index: number) => {
    if (scenario.enemies.length <= 1) return
    onChange({ ...scenario, enemies: scenario.enemies.filter((_, i) => i !== index) })
  }

  const setCardQty = (defId: string, delta: number) => {
    const current = scenario.cardQuantities[defId] ?? 0
    const next = Math.max(0, Math.min(10, current + delta))
    const quantities = { ...scenario.cardQuantities }
    if (next === 0) {
      delete quantities[defId]
    } else {
      quantities[defId] = next
    }
    onChange({ ...scenario, cardQuantities: quantities })
  }

  const togglePart = (part: BehavioralPartDefinition) => {
    const has = scenario.parts.some(p => p.id === part.id)
    onChange({
      ...scenario,
      parts: has ? scenario.parts.filter(p => p.id !== part.id) : [...scenario.parts, part],
    })
  }

  const totalCards = Object.values(scenario.cardQuantities).reduce((a, b) => a + b, 0)

  return (
    <div>
      {/* Equipment */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Equipment</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BODY_SLOTS.map(slot => (
            <div key={slot}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{slot}</div>
              <select
                value={scenario.equipment[slot]?.id ?? ''}
                onChange={(e) => setEquipment(slot, e.target.value || null)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="">-- none --</option>
                {equipmentBySlot(slot).map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} — {eq.description}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Enemies */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Enemies ({scenario.enemies.length}/3)</span>
        {scenario.enemies.map((enemy, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <select
              value={enemy.id}
              onChange={(e) => setEnemyAtIndex(i, e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            >
              <optgroup label="Standard">
                {SECTOR1_ENEMIES.map(e => (
                  <option key={e.id} value={e.id}>{e.name} (HP {e.maxHealth})</option>
                ))}
              </optgroup>
              <optgroup label="Elite">
                {SECTOR1_ELITES.map(e => (
                  <option key={e.id} value={e.id}>{e.name} (HP {e.maxHealth})</option>
                ))}
              </optgroup>
              <optgroup label="Boss">
                <option value={SECTOR1_BOSS.id}>{SECTOR1_BOSS.name} (HP {SECTOR1_BOSS.maxHealth})</option>
              </optgroup>
            </select>
            {scenario.enemies.length > 1 && (
              <button onClick={() => removeEnemy(i)} style={{ ...smallBtnStyle, color: 'var(--danger)' }}>X</button>
            )}
          </div>
        ))}
        {scenario.enemies.length < 3 && (
          <button onClick={addEnemy} style={{ ...smallBtnStyle, marginTop: 4 }}>+ Add Enemy</button>
        )}
      </div>

      {/* Deck */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Deck ({totalCards} cards)</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {allCardDefs.map(card => {
            const qty = scenario.cardQuantities[card.id] ?? 0
            return (
              <div key={card.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 0',
                opacity: qty > 0 ? 1 : 0.5,
              }}>
                <button onClick={() => setCardQty(card.id, -1)} style={smallBtnStyle} disabled={qty === 0}>-</button>
                <span style={{ width: 16, textAlign: 'center', fontSize: 13, fontFamily: 'monospace' }}>{qty}</span>
                <button onClick={() => setCardQty(card.id, 1)} style={smallBtnStyle}>+</button>
                <span style={{ fontSize: 13 }}>
                  {card.name}
                  <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
                    ({card.heatCost >= 0 ? '+' : ''}{card.heatCost}H)
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Behavioral Parts */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Behavioral Parts</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {BEHAVIORAL_PARTS.map(part => {
            const active = scenario.parts.some(p => p.id === part.id)
            return (
              <label key={part.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                cursor: 'pointer',
                opacity: active ? 1 : 0.6,
              }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => togglePart(part)}
                />
                <span>{part.name}</span>
                <span style={{ color: 'var(--muted)' }}>— {part.description}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Stats</span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>
            Health:
            <input
              type="number"
              value={scenario.health}
              onChange={(e) => onChange({ ...scenario, health: Number(e.target.value), maxHealth: Math.max(scenario.maxHealth, Number(e.target.value)) })}
              min={1} max={200}
              style={{ ...selectStyle, width: 60, marginLeft: 4 }}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            Max Health:
            <input
              type="number"
              value={scenario.maxHealth}
              onChange={(e) => onChange({ ...scenario, maxHealth: Number(e.target.value) })}
              min={1} max={200}
              style={{ ...selectStyle, width: 60, marginLeft: 4 }}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            Draw Count:
            <input
              type="number"
              value={scenario.drawCount}
              onChange={(e) => onChange({ ...scenario, drawCount: Number(e.target.value) })}
              min={1} max={10}
              style={{ ...selectStyle, width: 60, marginLeft: 4 }}
            />
          </label>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={totalCards === 0}
        style={{
          width: '100%',
          padding: '12px 24px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: totalCards > 0 ? 'pointer' : 'not-allowed',
          opacity: totalCards > 0 ? 1 : 0.5,
        }}
      >
        Start Combat ({totalCards} cards vs {scenario.enemies.length} enem{scenario.enemies.length === 1 ? 'y' : 'ies'})
      </button>
    </div>
  )
}
