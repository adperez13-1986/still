import type { CombatState, BodySlot, EquipmentDefinition, BehavioralPartDefinition, BodyAction } from '../game/types'
import { BODY_SLOTS } from '../game/types'
import { ALL_CARDS } from '../data/cards'
import type { SlotProjection } from '../game/combat'
import { getAllowedSlots } from '../game/combat'

interface Props {
  combat: CombatState
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
  selectedCardId: string | null
  projections: SlotProjection[]
  activeSlot: BodySlot | null
  onAssign: (slot: BodySlot) => void
}

function actionSummary(action: BodyAction): string {
  switch (action.type) {
    case 'damage': return `Atk ${action.baseValue}`
    case 'block': return `Blk ${action.baseValue}`
    case 'heal': return `Heal ${action.baseValue}`
    case 'draw': return `+${action.baseValue} draw`
    case 'foresight': return `Eye ${action.baseValue}`
    case 'debuff': return `${(action.debuffType ?? '').slice(0, 4)} ${action.baseValue}`
    case 'reduce': return `-${action.baseValue}/hit`
    default: return ''
  }
}

function computeValidSlots(
  combat: CombatState,
  equipment: Record<BodySlot, EquipmentDefinition | null>,
  parts: BehavioralPartDefinition[],
  selectedCardId: string | null,
): Set<BodySlot> | null {
  if (!selectedCardId) return null
  const cardInst = combat.hand.find(c => c.instanceId === selectedCardId)
  if (!cardInst) return null
  const baseDef = ALL_CARDS[cardInst.definitionId]
  const def = cardInst.isUpgraded && baseDef?.upgraded ? baseDef.upgraded : baseDef
  if (!def) return null

  const hasDualLoader = parts.some(p => p.effect.type === 'dualLoader')
  const valid = new Set<BodySlot>()

  if (def.freePlay && def.category.type === 'system' && def.category.effects.some(e => e.type === 'applyFeedback')) {
    for (const slot of BODY_SLOTS) {
      if (equipment[slot]) valid.add(slot)
    }
    return valid
  }

  if (def.category.type === 'system') {
    const homeSlot = def.category.homeSlot
    if (!combat.disabledSlots.includes(homeSlot) && combat.slotModifiers[homeSlot] === null) {
      valid.add(homeSlot)
    }
    return valid
  }

  if (def.category.type === 'slot') {
    const isOverride = def.category.effect.type === 'override'
    const isFeedback = def.category.effect.type === 'feedback'
    const allowed = getAllowedSlots(def)
    for (const slot of BODY_SLOTS) {
      if (combat.disabledSlots.includes(slot)) continue
      if (allowed && !allowed.includes(slot)) continue
      if (combat.slotModifiers[slot] === '__system__' && !isFeedback) continue
      if (combat.slotModifiers[slot] !== null && combat.slotModifiers[slot] !== '__system__') {
        if ((!hasDualLoader && !isFeedback) || combat.slotModifiers2[slot] !== null) continue
      }
      if (!isOverride && !equipment[slot]) continue
      valid.add(slot)
    }
    return valid
  }

  return valid
}

export default function BodyRow({
  combat, equipment, parts, selectedCardId, projections, activeSlot, onAssign,
}: Props) {
  const validSlots = computeValidSlots(combat, equipment, parts, selectedCardId)

  return (
    <div>
      <div style={{
        fontSize: 9,
        letterSpacing: 2,
        color: '#3d3858',
        marginBottom: 4,
        fontFamily: 'monospace',
      }}>
        // BODY · {BODY_SLOTS.length} SLOTS
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 4,
      }}>
        {BODY_SLOTS.map(slot => {
          const equip = equipment[slot]
          const modId = combat.slotModifiers[slot]
          const modId2 = combat.slotModifiers2[slot]
          const isDisabled = combat.disabledSlots.includes(slot)
          const isValid = validSlots?.has(slot) ?? false
          const isActive = activeSlot === slot
          const proj = projections.find(p => p.slot === slot)
          const hasFeedback = combat.persistentFeedback[slot]

          const allCardsArr = [
            ...combat.hand, ...combat.drawPile,
            ...combat.discardPile, ...combat.exhaustPile,
          ]
          let modName: string | null = null
          if (modId === '__system__') modName = '⚡'
          else if (modId) {
            const inst = allCardsArr.find(c => c.instanceId === modId)
            if (inst) modName = ALL_CARDS[inst.definitionId]?.name ?? null
          }
          const isModded = !!modName || !!modId2

          const labelMap: Record<BodySlot, string> = {
            Head: 'Head', Arms: 'Arms', Torso: 'Torso', Legs: 'Legs',
          }

          return (
            <div
              key={slot}
              onClick={() => isValid && onAssign(slot)}
              style={{
                position: 'relative',
                background: isModded
                  ? 'linear-gradient(180deg, rgba(178,164,245,0.18), rgba(178,164,245,0.08))'
                  : 'linear-gradient(180deg, #1f1a3a 0%, #15122a 100%)',
                border: `1px solid ${
                  isActive ? '#b2a4f5'
                    : isValid ? '#b2a4f5'
                    : isDisabled ? '#e74c3c'
                    : isModded ? '#b2a4f5'
                    : '#3d3868'
                }`,
                boxShadow: isActive
                  ? '0 0 0 1px #b2a4f5, 0 0 12px rgba(178,164,245,0.45)'
                  : isValid
                    ? '0 0 0 1px #b2a4f5'
                    : 'none',
                borderRadius: 5,
                padding: '5px 6px 4px',
                cursor: isValid ? 'pointer' : 'default',
                opacity: activeSlot && !isActive ? 0.5 : 1,
                transition: 'all 0.15s',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                minWidth: 0,
              }}
            >
              <div style={{
                fontSize: 9,
                letterSpacing: 1,
                color: isDisabled ? '#e74c3c' : '#6b6585',
                lineHeight: 1,
                marginBottom: 2,
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}>
                {labelMap[slot]}
                {isDisabled && <span style={{ marginLeft: 3 }}>OFF</span>}
                {hasFeedback && !isDisabled && <span style={{ marginLeft: 3, color: '#f39c12' }}>FB</span>}
              </div>
              <div style={{
                fontSize: 10,
                color: '#e9e4f5',
                fontWeight: 'bold',
                lineHeight: 1.1,
                marginBottom: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {equip ? equip.name : '—'}
              </div>
              <div style={{
                fontSize: 9,
                color: '#a09bbe',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {equip ? actionSummary(equip.action) : ''}
              </div>
              {proj && proj.willFire && (proj.damage > 0 || proj.block > 0 || proj.heal > 0) && (
                <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
                  {proj.damage > 0 && (
                    <span style={{ fontSize: 8, color: '#e74c3c', fontWeight: 'bold' }}>
                      →{proj.damage}
                    </span>
                  )}
                  {proj.block > 0 && (
                    <span style={{ fontSize: 8, color: '#74b9ff', fontWeight: 'bold' }}>
                      →{proj.block}b
                    </span>
                  )}
                  {proj.heal > 0 && (
                    <span style={{ fontSize: 8, color: '#2ecc71', fontWeight: 'bold' }}>
                      →{proj.heal}
                    </span>
                  )}
                </div>
              )}
              {isModded && (
                <div style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: '#b2a4f5',
                  color: '#1a1530',
                  fontSize: 9,
                  fontWeight: 'bold',
                  padding: '0 4px',
                  borderRadius: 3,
                  boxShadow: '0 0 0 2px #0c0a18',
                  lineHeight: 1.4,
                }}>
                  ◆
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
