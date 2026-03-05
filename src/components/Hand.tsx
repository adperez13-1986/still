import type { CombatState } from '../game/types'
import { ALL_CARDS } from '../data/cards'
import { getHeatThreshold } from '../game/types'

interface Props {
  combat: CombatState
  selectedCardId: string | null
  onSelectSlotCard: (instanceId: string | null) => void
  onPlaySystemCard: (instanceId: string) => void
  compact?: boolean
}

function isThresholdMet(currentHeat: number, required: string): boolean {
  const order = ['Cool', 'Warm', 'Hot', 'Overheat']
  const current = getHeatThreshold(currentHeat)
  return order.indexOf(current) >= order.indexOf(required)
}

export default function Hand({ combat, selectedCardId, onSelectSlotCard, onPlaySystemCard, compact }: Props) {
  // Filter out cards assigned to slots
  const assignedIds = new Set(
    Object.values(combat.slotModifiers).filter((id): id is string => id !== null)
  )
  const visibleHand = combat.hand.filter(c => !assignedIds.has(c.instanceId))

  const canPlay = combat.phase === 'planning' && !combat.shutdown

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        justifyContent: 'center',
        padding: '6px',
        minHeight: '30px',
        alignItems: 'center',
      }}>
        {visibleHand.map(card => {
          const baseDef = ALL_CARDS[card.definitionId]
          if (!baseDef) return null
          const def = card.isUpgraded && baseDef.upgraded ? baseDef.upgraded : baseDef

          const isSlot = def.category.type === 'slot'
          const isSystem = def.category.type === 'system'
          const isSelected = selectedCardId === card.instanceId
          const heatMet = !def.heatCondition || isThresholdMet(combat.heat, def.heatCondition)
          const playable = canPlay && heatMet

          return (
            <div
              key={card.instanceId}
              onClick={() => {
                if (!playable) return
                if (isSlot) {
                  onSelectSlotCard(isSelected ? null : card.instanceId)
                } else if (isSystem) {
                  onPlaySystemCard(card.instanceId)
                }
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: isSelected ? '#a29bfe' : '#1a1a2e',
                border: `1px solid ${isSelected ? '#a29bfe' : !heatMet ? '#e74c3c' : '#2c3e50'}`,
                cursor: playable ? 'pointer' : 'default',
                opacity: playable ? 1 : 0.5,
                fontSize: '11px',
                color: isSelected ? '#fff' : '#e8e8e8',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              {def.name}
              <span style={{
                fontSize: '9px',
                color: isSelected ? 'rgba(255,255,255,0.8)' : (def.heatCost > 0 ? '#e74c3c' : def.heatCost < 0 ? '#00cec9' : '#888'),
                fontWeight: 'bold',
              }}>
                {def.heatCost >= 0 ? '+' : ''}{def.heatCost}H
              </span>
            </div>
          )
        })}
        {visibleHand.length === 0 && (
          <div style={{ color: '#555', fontSize: '11px' }}>
            {combat.shutdown ? 'SHUTDOWN' : 'Empty'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      justifyContent: 'center',
      padding: '12px',
      minHeight: '60px',
      alignItems: 'flex-end',
    }}>
      {visibleHand.map(card => {
        const baseDef = ALL_CARDS[card.definitionId]
        if (!baseDef) return null
        const def = card.isUpgraded && baseDef.upgraded ? baseDef.upgraded : baseDef

        const isSlot = def.category.type === 'slot'
        const isSystem = def.category.type === 'system'
        const isSelected = selectedCardId === card.instanceId
        const heatMet = !def.heatCondition || isThresholdMet(combat.heat, def.heatCondition)
        const playable = canPlay && heatMet

        const slotColors: Record<string, string> = {
          Amplify: '#a29bfe', Redirect: '#74b9ff', Repeat: '#fd79a8', Override: '#e17055',
        }
        const systemColors: Record<string, string> = {
          Cooling: '#00cec9', Draw: '#ffeaa7', Conditional: '#fab1a0',
        }
        const categoryColor = isSlot
          ? (slotColors[def.category.modifier] ?? '#888')
          : (systemColors[def.category.modifier] ?? '#f1c40f')

        return (
          <div
            key={card.instanceId}
            onClick={() => {
              if (!playable) return
              if (isSlot) {
                onSelectSlotCard(isSelected ? null : card.instanceId)
              } else if (isSystem) {
                onPlaySystemCard(card.instanceId)
              }
            }}
            style={{
              width: '130px',
              padding: '10px',
              backgroundColor: isSelected ? '#a29bfe' : '#1a1a2e',
              border: `2px solid ${isSelected ? '#a29bfe' : !heatMet ? '#e74c3c' : '#2c3e50'}`,
              borderRadius: '8px',
              cursor: playable ? 'pointer' : 'default',
              opacity: playable ? 1 : 0.5,
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: isSelected ? '#fff' : '#e8e8e8',
            }}>
              {def.name}
            </div>
            <div style={{
              fontSize: '10px',
              color: isSelected ? 'rgba(255,255,255,0.8)' : '#888',
              marginBottom: '6px',
              lineHeight: '1.4',
            }}>
              {def.description}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span style={{
                color: def.heatCost > 0 ? '#e74c3c' : def.heatCost < 0 ? '#00cec9' : '#888',
                fontWeight: 'bold',
              }}>
                {def.heatCost >= 0 ? '+' : ''}{def.heatCost}H
              </span>
              <span style={{
                padding: '0 4px',
                borderRadius: '3px',
                background: isSlot ? 'rgba(162,155,254,0.2)' : 'rgba(241,196,15,0.2)',
                color: categoryColor,
                fontSize: '9px',
              }}>
                {isSlot ? def.category.modifier : 'System'}
              </span>
            </div>
            {def.keywords.length > 0 && (
              <div style={{ fontSize: '9px', color: '#888', marginTop: '3px' }}>
                {def.keywords.join(', ')}
              </div>
            )}
            {def.heatCondition && (
              <div style={{
                fontSize: '9px',
                color: heatMet ? '#00cec9' : '#e74c3c',
                marginTop: '2px',
              }}>
                Req: {def.heatCondition}+
              </div>
            )}
          </div>
        )
      })}
      {visibleHand.length === 0 && (
        <div style={{ color: '#555', fontSize: '13px', alignSelf: 'center' }}>
          {combat.shutdown ? 'SHUTDOWN — no cards playable' : 'Hand is empty'}
        </div>
      )}
    </div>
  )
}
