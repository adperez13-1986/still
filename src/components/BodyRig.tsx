import type { CombatState, BodySlot, EquipmentDefinition, BehavioralPartDefinition, BodyAction } from '../game/types'
import { BODY_SLOTS } from '../game/types'
import { ALL_CARDS } from '../data/cards'
import type { SlotProjection } from '../game/combat'
import { getAllowedSlots } from '../game/combat'
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'

interface Props {
  combat: CombatState
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
  selectedCardId: string | null
  projections: SlotProjection[]
  activeSlot: BodySlot | null
  onAssign: (slot: BodySlot) => void
}

// Mock-fidelity slot positions (variation A — Paper Doll).
// Coordinates are relative to the body-rig container (which has fixed min-height 256px).
// ARMS goes on the LEFT (mock's ArmL position) since the game has 4 slots, not 5.
const SLOT_LAYOUT: Record<BodySlot, { top: number; left?: number; right?: number; width: number; centered?: boolean }> = {
  Head:  { top: 0,   centered: true, width: 96 },
  Torso: { top: 76,  centered: true, width: 84 },
  Arms:  { top: 84,  left: -14,      width: 62 },
  Legs:  { top: 200, centered: true, width: 96 },
}

function actionSummary(action: BodyAction): string {
  switch (action.type) {
    case 'damage': return `Atk ${action.baseValue}`
    case 'block': return `Block ${action.baseValue}`
    case 'heal': return `Heal ${action.baseValue}`
    case 'draw': return `+${action.baseValue} draw`
    case 'foresight': return `Foresight ${action.baseValue}`
    case 'debuff': return `${action.debuffType ?? 'Debuff'} ${action.baseValue}`
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

export default function BodyRig({
  combat, equipment, parts, selectedCardId, projections, activeSlot, onAssign,
}: Props) {
  const validSlots = computeValidSlots(combat, equipment, parts, selectedCardId)
  const hasSelected = !!selectedCardId

  return (
    <div style={{
      position: 'relative',
      minHeight: 256,
      width: '100%',
    }}>
      {/* Dotted spine (decorative wire) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        transform: 'translateX(-50%)',
        backgroundImage: 'repeating-linear-gradient(180deg, #3d3868 0 4px, transparent 4px 8px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Faint Still ghost behind the slots */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.18,
        filter: 'drop-shadow(0 0 12px rgba(178,164,245,0.35)) saturate(0.7)',
        animation: 'rig-bob 4s ease-in-out infinite',
      }}>
        <Sprite art={STILL_SPRITE.art} palette={STILL_SPRITE.palette} pixelSize={9} />
      </div>

      <style>{`
        @keyframes rig-bob {
          0%, 100% { transform: translate(-50%, calc(-50% - 1px)); }
          50%      { transform: translate(-50%, calc(-50% + 3px)); }
        }
        @keyframes pulse-slot {
          0%, 100% { box-shadow: 0 0 0 1px #b2a4f5, 0 0 12px rgba(178,164,245,0.25); }
          50%      { box-shadow: 0 0 0 1px #b2a4f5, 0 0 24px rgba(178,164,245,0.5); }
        }
      `}</style>

      {/* Slot cells */}
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
        if (modId2) {
          const inst = allCardsArr.find(c => c.instanceId === modId2)
          if (inst) modName = `${modName ?? ''}${modName ? ' + ' : ''}${ALL_CARDS[inst.definitionId]?.name ?? ''}`
        }

        const layout = SLOT_LAYOUT[slot]
        const labelMap: Record<BodySlot, string> = {
          Head: 'HEAD', Arms: 'ARMS', Torso: 'TORSO', Legs: 'LEGS',
        }
        const isModded = !!modName

        const positionStyle: React.CSSProperties = layout.centered
          ? { left: '50%', transform: 'translateX(-50%)' }
          : layout.left != null
            ? { left: layout.left }
            : layout.right != null
              ? { right: layout.right }
              : {}

        return (
          <div
            key={slot}
            onClick={() => isValid && onAssign(slot)}
            style={{
              position: 'absolute',
              top: layout.top,
              width: layout.width,
              ...positionStyle,
              padding: '6px 6px 5px',
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
                ? '0 0 0 1px #b2a4f5, 0 0 16px rgba(178,164,245,0.5)'
                : (hasSelected && isValid)
                  ? '0 0 0 1px #b2a4f5, 0 0 12px rgba(178,164,245,0.3)'
                  : 'none',
              animation: hasSelected && isValid ? 'pulse-slot 1.4s ease-in-out infinite' : 'none',
              borderRadius: 8,
              cursor: isValid ? 'pointer' : 'default',
              opacity: activeSlot && !isActive ? 0.5 : 1,
              transition: 'opacity 0.2s, border-color 0.15s',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              zIndex: 1,
            }}
          >
            <div style={{
              fontSize: 9,
              letterSpacing: 1.5,
              color: isDisabled ? '#e74c3c' : '#6b6585',
              textTransform: 'uppercase',
              lineHeight: 1,
              marginBottom: 3,
              fontWeight: 'bold',
            }}>
              {labelMap[slot]}
              {isDisabled && <span style={{ marginLeft: 4 }}>OFF</span>}
              {hasFeedback && !isDisabled && <span style={{ marginLeft: 4, color: '#f39c12' }}>FB</span>}
            </div>
            <div style={{
              fontSize: 9.5,
              color: '#e9e4f5',
              fontWeight: 'bold',
              lineHeight: 1.15,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {equip ? equip.name : '—'}
            </div>
            <div style={{
              fontSize: 8.5,
              color: '#a09bbe',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {equip ? actionSummary(equip.action) : ''}
            </div>
            {proj && proj.willFire && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
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
            {modName && (
              <div style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#b2a4f5',
                color: '#1a1530',
                fontSize: 9,
                fontWeight: 'bold',
                letterSpacing: 1,
                padding: '1px 5px',
                borderRadius: 4,
                boxShadow: '0 0 0 2px #0c0a18',
                lineHeight: 1,
              }}>
                ◆
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
