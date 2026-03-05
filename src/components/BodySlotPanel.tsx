import type { CombatState, BodySlot, EquipmentDefinition } from '../game/types'
import { BODY_SLOTS } from '../game/types'
import { ALL_CARDS } from '../data/cards'
import type { SlotProjection } from '../game/combat'

interface Props {
  combat: CombatState
  equipment: Record<BodySlot, EquipmentDefinition | null>
  selectedCardId: string | null
  projections: SlotProjection[]
  onAssign: (slot: BodySlot) => void
  onUnassign: (slot: BodySlot) => void
}

export default function BodySlotPanel({ combat, equipment, selectedCardId, projections, onAssign, onUnassign }: Props) {
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
      backgroundColor: '#16213e',
      border: '1px solid #2c3e50',
      borderRadius: '8px',
      padding: '12px 16px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#aaa', letterSpacing: '1px' }}>
        BODY SLOTS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                padding: '10px',
                backgroundColor: isDisabled
                  ? 'rgba(231, 76, 60, 0.1)'
                  : isValid
                    ? 'rgba(162, 155, 254, 0.15)'
                    : '#1a1a2e',
                border: `2px solid ${
                  isValid ? '#a29bfe' : isDisabled ? '#e74c3c' : '#2c3e50'
                }`,
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#e8e8e8' }}>
                  {slot}
                  {isDisabled && <span style={{ color: '#e74c3c', marginLeft: '4px', fontSize: '10px' }}>DISABLED</span>}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                {equip ? equip.name : '(empty)'}
              </div>
              {equip && (
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  {equip.description}
                </div>
              )}

              {modName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '6px',
                }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    background: 'rgba(162,155,254,0.2)',
                    color: '#a29bfe',
                    borderRadius: '4px',
                  }}>
                    {modName}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUnassign(slot) }}
                    style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      background: 'transparent',
                      color: '#e74c3c',
                      border: '1px solid #e74c3c',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {isValid && !modName && (
                <div style={{ fontSize: '10px', color: '#a29bfe', marginTop: '4px' }}>
                  Click to assign
                </div>
              )}

              {/* Projection display */}
              {(() => {
                const proj = projections.find(p => p.slot === slot)
                if (!proj || !proj.willFire) return null
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', fontSize: '11px' }}>
                    {proj.damage > 0 && (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        → {proj.damage} dmg{proj.targetMode === 'all' ? ' ALL' : ''}
                      </span>
                    )}
                    {proj.block > 0 && (
                      <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                        → {proj.block} block
                      </span>
                    )}
                    {proj.heal > 0 && (
                      <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                        → {proj.heal} heal
                      </span>
                    )}
                    {proj.draw > 0 && (
                      <span style={{ color: '#dfe6e9', fontWeight: 'bold' }}>
                        → draw {proj.draw}
                      </span>
                    )}
                    {proj.heatCost !== 0 && (
                      <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
                        {proj.heatCost > 0 ? '+' : ''}{proj.heatCost}H
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
