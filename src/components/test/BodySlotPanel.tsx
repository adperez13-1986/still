import type { CombatState, BodySlot, EquipmentDefinition } from '../../game/types'
import { BODY_SLOTS } from '../../game/types'
import { ALL_CARDS } from '../../data/cards'

interface BodySlotPanelProps {
  combat: CombatState | null
  equipment: Record<BodySlot, EquipmentDefinition | null>
  selectedCardId: string | null
  onAssign: (slot: BodySlot) => void
  onUnassign: (slot: BodySlot) => void
}

export default function BodySlotPanel({ combat, equipment, selectedCardId, onAssign, onUnassign }: BodySlotPanelProps) {
  if (!combat) return null

  // If a slot modifier card is selected, determine valid slots
  let validSlots: Set<BodySlot> | null = null
  if (selectedCardId) {
    const cardInst = combat.hand.find(c => c.instanceId === selectedCardId)
    if (cardInst) {
      const def = ALL_CARDS[cardInst.definitionId]
      if (def?.category.type === 'slot') {
        const isOverride = def.category.effect.type === 'override'
        validSlots = new Set<BodySlot>()
        for (const slot of BODY_SLOTS) {
          if (combat.disabledSlots.includes(slot)) continue
          if (combat.slotModifiers[slot] !== null) continue
          if (!isOverride && !equipment[slot]) continue
          validSlots.add(slot)
        }
      }
    }
  }

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Body Slots</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {BODY_SLOTS.map(slot => {
          const equip = equipment[slot]
          const modInstanceId = combat.slotModifiers[slot]
          const isDisabled = combat.disabledSlots.includes(slot)
          const isValid = validSlots?.has(slot) ?? false

          // Find modifier card name
          let modName: string | null = null
          if (modInstanceId) {
            const allCards = [
              ...combat.hand, ...combat.drawPile,
              ...combat.discardPile, ...combat.exhaustPile,
            ]
            const inst = allCards.find(c => c.instanceId === modInstanceId)
            if (inst) modName = ALL_CARDS[inst.definitionId]?.name ?? null
          }

          return (
            <div
              key={slot}
              onClick={() => {
                if (isValid && selectedCardId) onAssign(slot)
              }}
              style={{
                padding: 10,
                background: isDisabled
                  ? 'rgba(231, 76, 60, 0.1)'
                  : isValid
                    ? 'rgba(162, 155, 254, 0.15)'
                    : 'var(--bg-surface)',
                border: `2px solid ${
                  isValid ? 'var(--accent)' : isDisabled ? 'var(--danger)' : 'var(--border)'
                }`,
                borderRadius: 8,
                cursor: isValid ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {slot}
                  {isDisabled && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>DISABLED</span>}
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {equip ? equip.name : '(empty)'}
              </div>

              {modName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                }}>
                  <span style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    background: 'rgba(162,155,254,0.2)',
                    color: 'var(--accent)',
                    borderRadius: 4,
                  }}>
                    {modName}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUnassign(slot) }}
                    style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      background: 'transparent',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Unassign
                  </button>
                </div>
              )}

              {isValid && !modName && (
                <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
                  Click to assign
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
