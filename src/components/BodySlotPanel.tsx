import { useState, useRef, useCallback } from 'react'
import type { CombatState, BodySlot, EquipmentDefinition, HeatThreshold } from '../game/types'
import { BODY_SLOTS, getHeatThreshold } from '../game/types'
import { ALL_CARDS } from '../data/cards'
import type { SlotProjection } from '../game/combat'

const HEAT_COLORS: Record<HeatThreshold, string> = {
  Cool: '#27ae60',
  Warm: '#f1c40f',
  Hot: '#e67e22',
  Overheat: '#e74c3c',
}

function HeatValueDisplay({ total, heatContrib, suffix, color, fontSize }: {
  total: number
  heatContrib: number
  suffix: string
  color: string
  fontSize: string
}) {
  if (total <= 0) return null
  const base = total - heatContrib
  const showBreakdown = heatContrib > 0 && base > 0
  return (
    <span style={{ fontWeight: 'bold', fontSize }}>
      <span style={{ color }}>→{showBreakdown ? base : total}</span>
      {showBreakdown && (
        <span style={{ color: '#e67e22' }}>+{heatContrib}</span>
      )}
      <span style={{ color }}>{suffix}</span>
    </span>
  )
}

function ThresholdBadge({ heat, fontSize }: { heat: number; fontSize: string }) {
  const threshold = getHeatThreshold(heat)
  return (
    <span style={{
      fontSize,
      color: HEAT_COLORS[threshold],
      opacity: threshold === 'Cool' ? 0.5 : 1,
    }}>
      @{threshold}
    </span>
  )
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  damage: 'Damage',
  block: 'Block',
  heal: 'Heal',
  draw: 'Draw',
  coolHeat: 'Cool',
  foresight: 'Foresight',
}

function EquipPopup({ equip, onClose }: { equip: EquipmentDefinition; onClose: () => void }) {
  const actionLabel = ACTION_TYPE_LABELS[equip.action.type] ?? equip.action.type
  const targetLabel = equip.action.targetMode === 'all_enemies' ? ' (all)' : equip.action.targetMode === 'self' ? ' (self)' : ''
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#1e1e2e',
          border: '2px solid #4a4a6a',
          borderRadius: '10px',
          padding: '16px',
          maxWidth: '280px',
          width: '90%',
          color: '#e8e8e8',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{equip.name}</div>
        <div style={{
          fontSize: '10px',
          color: equip.rarity === 'rare' ? '#f1c40f' : equip.rarity === 'uncommon' ? '#74b9ff' : '#888',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {equip.rarity} · {equip.slot}
        </div>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>{equip.description}</div>
        <div style={{ fontSize: '11px', color: '#dfe6e9', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span>{actionLabel} {equip.action.baseValue}{targetLabel}</span>
          {equip.heatBonusThreshold && equip.heatBonusValue && (
            <span style={{ color: '#e67e22' }}>@{equip.heatBonusThreshold}: +{equip.heatBonusValue}</span>
          )}
          {equip.extraHeatGenerated ? (
            <span style={{ color: '#e67e22' }}>+{equip.extraHeatGenerated} Heat generated</span>
          ) : null}
          {equip.bonusBlockPerHeatLost ? (
            <span style={{ color: '#3498db' }}>+{equip.bonusBlockPerHeatLost} Block per Heat cooled</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

interface Props {
  combat: CombatState
  equipment: Record<BodySlot, EquipmentDefinition | null>
  selectedCardId: string | null
  projections: SlotProjection[]
  onAssign: (slot: BodySlot) => void
  onUnassign: (slot: BodySlot) => void
  compact?: boolean
  activeSlot?: BodySlot | null
}

export default function BodySlotPanel({ combat, equipment, selectedCardId, projections, onAssign, onUnassign, compact, activeSlot }: Props) {
  const [popupEquip, setPopupEquip] = useState<EquipmentDefinition | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startLongPress = useCallback((equip: EquipmentDefinition) => {
    longPressTimer.current = setTimeout(() => {
      setPopupEquip(equip)
    }, 500)
  }, [])

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])
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
      padding: compact ? '4px 8px' : '12px 16px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: compact ? '4px' : '8px', fontSize: compact ? '10px' : '12px', color: '#aaa', letterSpacing: '1px' }}>
        BODY SLOTS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? '4px' : '8px' }}>
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

          const proj = projections.find(p => p.slot === slot)

          if (compact) {
            return (
              <div
                key={slot}
                onClick={() => {
                  if (isValid && selectedCardId) onAssign(slot)
                }}
                onTouchStart={() => equip && startLongPress(equip)}
                onTouchEnd={cancelLongPress}
                onTouchCancel={cancelLongPress}
                onMouseDown={() => equip && startLongPress(equip)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  backgroundColor: activeSlot === slot
                    ? 'rgba(162, 155, 254, 0.25)'
                    : isDisabled
                      ? 'rgba(231, 76, 60, 0.1)'
                      : isValid
                        ? 'rgba(162, 155, 254, 0.15)'
                        : '#1a1a2e',
                  border: `1px solid ${
                    activeSlot === slot ? '#a29bfe' : isValid ? '#a29bfe' : isDisabled ? '#e74c3c' : '#2c3e50'
                  }`,
                  boxShadow: activeSlot === slot ? '0 0 8px #a29bfe66' : 'none',
                  borderRadius: '4px',
                  cursor: isValid ? 'pointer' : equip ? 'default' : 'default',
                  fontSize: '11px',
                  color: '#e8e8e8',
                  minHeight: '28px',
                  flexWrap: 'wrap',
                  opacity: activeSlot && activeSlot !== slot ? 0.4 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s, box-shadow 0.2s',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                <span style={{ fontWeight: 'bold', minWidth: '48px', fontSize: '11px' }}>
                  {slot}
                  {isDisabled && <span style={{ color: '#e74c3c', marginLeft: '3px', fontSize: '9px' }}>OFF</span>}
                </span>
                <span style={{ color: '#888', fontSize: '11px' }}>
                  {equip ? equip.name : '(empty)'}
                </span>
                {/* Projection inline */}
                {proj && proj.willFire && (
                  <>
                    <ThresholdBadge heat={proj.heatAtExecution} fontSize="9px" />
                    <HeatValueDisplay total={proj.damage} heatContrib={proj.heatDmgContrib} suffix={`dmg${proj.targetMode === 'all' ? ' ALL' : ''}`} color="#e74c3c" fontSize="10px" />
                    <HeatValueDisplay total={proj.block} heatContrib={proj.heatBlkContrib} suffix="blk" color="#3498db" fontSize="10px" />
                    <HeatValueDisplay total={proj.heal} heatContrib={proj.heatHealContrib} suffix="hp" color="#2ecc71" fontSize="10px" />
                    {proj.draw > 0 && (
                      <span style={{ color: '#dfe6e9', fontWeight: 'bold', fontSize: '10px' }}>
                        draw {proj.draw}
                      </span>
                    )}
                    {proj.heatCost !== 0 && (
                      <span style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '10px' }}>
                        {proj.heatCost > 0 ? '+' : ''}{proj.heatCost}H
                      </span>
                    )}
                  </>
                )}
                {/* Modifier badge + remove */}
                {modName && (
                  <>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      background: 'rgba(162,155,254,0.2)',
                      color: '#a29bfe',
                      borderRadius: '3px',
                    }}>
                      {modName}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onUnassign(slot) }}
                      style={{
                        fontSize: '9px',
                        padding: '0 4px',
                        background: 'transparent',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        lineHeight: '1',
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
                {isValid && !modName && (
                  <span style={{ fontSize: '9px', color: '#a29bfe' }}>Tap</span>
                )}
              </div>
            )
          }

          return (
            <div
              key={slot}
              onClick={() => {
                if (isValid && selectedCardId) onAssign(slot)
              }}
              onMouseDown={() => equip && startLongPress(equip)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={() => equip && startLongPress(equip)}
              onTouchEnd={cancelLongPress}
              onTouchCancel={cancelLongPress}
              style={{
                padding: '10px',
                backgroundColor: activeSlot === slot
                  ? 'rgba(162, 155, 254, 0.25)'
                  : isDisabled
                    ? 'rgba(231, 76, 60, 0.1)'
                    : isValid
                      ? 'rgba(162, 155, 254, 0.15)'
                      : '#1a1a2e',
                border: `2px solid ${
                  activeSlot === slot ? '#a29bfe' : isValid ? '#a29bfe' : isDisabled ? '#e74c3c' : '#2c3e50'
                }`,
                boxShadow: activeSlot === slot ? '0 0 10px #a29bfe66' : 'none',
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'default',
                opacity: activeSlot && activeSlot !== slot ? 0.4 : 1,
                transition: 'all 0.2s',
                userSelect: 'none',
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
                if (!proj || !proj.willFire) return null
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', fontSize: '11px', alignItems: 'center' }}>
                    <ThresholdBadge heat={proj.heatAtExecution} fontSize="10px" />
                    <HeatValueDisplay total={proj.damage} heatContrib={proj.heatDmgContrib} suffix={` dmg${proj.targetMode === 'all' ? ' ALL' : ''}`} color="#e74c3c" fontSize="11px" />
                    <HeatValueDisplay total={proj.block} heatContrib={proj.heatBlkContrib} suffix=" block" color="#3498db" fontSize="11px" />
                    <HeatValueDisplay total={proj.heal} heatContrib={proj.heatHealContrib} suffix=" heal" color="#2ecc71" fontSize="11px" />
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
      {popupEquip && (
        <EquipPopup equip={popupEquip} onClose={() => setPopupEquip(null)} />
      )}
    </div>
  )
}
