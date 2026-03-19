import type { CombatState, BodySlot, EquipmentDefinition, BehavioralPartDefinition } from '../../game/types'
import { ALL_CARDS } from '../../data/cards'

interface StateInspectorProps {
  combat: CombatState | null
  stillHealth: number
  maxHealth: number
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
}

function cardName(defId: string): string {
  return ALL_CARDS[defId]?.name ?? defId
}

export default function StateInspector({ combat, stillHealth, maxHealth, equipment, parts }: StateInspectorProps) {
  if (!combat) {
    return (
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        color: 'var(--muted)',
      }}>
        No combat active. Configure scenario and start combat.
      </div>
    )
  }

  const assignedCount = Object.values(combat.slotModifiers).filter(id => id !== null).length
  const visibleHand = combat.hand.length - assignedCount

  const rows: [string, string | number][] = [
    ['Phase', combat.phase],
    ['Round', combat.roundNumber],
    ['Energy', `${combat.currentEnergy}/${combat.maxEnergy}`],
    ['Health', `${stillHealth}/${maxHealth}`],
    ['Block', combat.block],
    ['Hand', assignedCount > 0 ? `${visibleHand} cards (+${assignedCount} assigned)` : `${visibleHand} cards`],
    ['Draw Pile', `${combat.drawPile.length} cards`],
    ['Discard', `${combat.discardPile.length} cards`],
    ['Exhaust', `${combat.exhaustPile.length} cards`],
    ['Disabled Slots', combat.disabledSlots.length > 0 ? combat.disabledSlots.join(', ') : 'none'],
  ]

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>State Inspector</div>

      {/* Core stats */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: '2px 8px 2px 0', color: 'var(--muted)' }}>{label}</td>
              <td style={{ padding: '2px 0', fontFamily: 'monospace' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Status effects */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: 'var(--muted)' }}>Status: </span>
        {combat.statusEffects.length === 0
          ? <span style={{ color: 'var(--muted)' }}>none</span>
          : combat.statusEffects.map((s) => (
            <span key={s.type} style={{
              display: 'inline-block',
              padding: '1px 6px',
              margin: '0 2px',
              background: 'var(--bg-surface)',
              borderRadius: 4,
              fontSize: 12,
            }}>
              {s.type} x{s.stacks}
            </span>
          ))
        }
      </div>

      {/* Slot modifiers */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: 'var(--muted)' }}>Slot Modifiers: </span>
        {(['Head', 'Torso', 'Arms', 'Legs'] as BodySlot[]).map((slot) => {
          const modId = combat.slotModifiers[slot]
          const equip = equipment[slot]
          return (
            <span key={slot} style={{
              display: 'inline-block',
              padding: '1px 6px',
              margin: '0 2px',
              background: 'var(--bg-surface)',
              borderRadius: 4,
              fontSize: 12,
            }}>
              {slot}: {equip?.name ?? '(empty)'}{modId ? ` + mod` : ''}
            </span>
          )
        })}
      </div>

      {/* Hand contents */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: 'var(--muted)' }}>Hand: </span>
        {combat.hand.length === 0
          ? <span style={{ color: 'var(--muted)' }}>empty</span>
          : combat.hand.map((c) => (
            <span key={c.instanceId} style={{
              display: 'inline-block',
              padding: '1px 6px',
              margin: '1px 2px',
              background: 'var(--bg-surface)',
              borderRadius: 4,
              fontSize: 12,
            }}>
              {cardName(c.definitionId)}
            </span>
          ))
        }
      </div>

      {/* Parts */}
      {parts.length > 0 && (
        <div>
          <span style={{ color: 'var(--muted)' }}>Parts: </span>
          {parts.map((p) => (
            <span key={p.id} style={{
              display: 'inline-block',
              padding: '1px 6px',
              margin: '1px 2px',
              background: 'var(--bg-surface)',
              borderRadius: 4,
              fontSize: 12,
            }}>
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Enemies */}
      <div style={{ marginTop: 8 }}>
        <span style={{ color: 'var(--muted)' }}>Enemies: </span>
        {combat.enemies.map((e) => (
          <span key={e.instanceId} style={{
            display: 'inline-block',
            padding: '1px 6px',
            margin: '1px 2px',
            background: e.isDefeated ? 'var(--danger)' : 'var(--bg-surface)',
            borderRadius: 4,
            fontSize: 12,
            opacity: e.isDefeated ? 0.5 : 1,
          }}>
            {e.definitionId} {e.currentHealth}/{e.maxHealth}
            {e.block > 0 && ` [${e.block}B]`}
            {e.isDefeated && ' DEAD'}
          </span>
        ))}
      </div>
    </div>
  )
}
