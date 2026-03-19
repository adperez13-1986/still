import type { CombatState } from '../../game/types'
import { ALL_CARDS } from '../../data/cards'

interface HandPanelProps {
  combat: CombatState | null
  selectedCardId: string | null
  onSelectCard: (instanceId: string | null) => void
  onPlaySystemCard: (instanceId: string) => void
}

export default function HandPanel({ combat, selectedCardId, onSelectCard, onPlaySystemCard }: HandPanelProps) {
  // Filter out cards assigned to slots — they stay in hand array for tracking
  // but shouldn't be displayed or playable
  const assignedIds = new Set(
    combat ? Object.values(combat.slotModifiers).filter((id): id is string => id !== null) : []
  )
  const visibleHand = combat?.hand.filter(c => !assignedIds.has(c.instanceId)) ?? []

  if (!combat || visibleHand.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        color: 'var(--muted)',
        textAlign: 'center',
      }}>
        {combat ? 'Hand is empty' : 'No combat active'}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
        Hand ({visibleHand.length} cards)
        {selectedCardId && (
          <span style={{ color: 'var(--accent)', fontWeight: 'normal', marginLeft: 8 }}>
            — select a slot to assign modifier
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {visibleHand.map(card => {
          const def = ALL_CARDS[card.definitionId]
          if (!def) return null
          const isSlot = def.category.type === 'slot'
          const isSystem = def.category.type === 'system'
          const isSelected = selectedCardId === card.instanceId
          const canPlay = combat.phase === 'planning'

          const affordable = combat.currentEnergy >= def.energyCost

          return (
            <div
              key={card.instanceId}
              onClick={() => {
                if (!canPlay || !affordable) return
                if (isSlot) {
                  onSelectCard(isSelected ? null : card.instanceId)
                } else if (isSystem) {
                  onPlaySystemCard(card.instanceId)
                }
              }}
              style={{
                width: 140,
                padding: 10,
                background: isSelected ? 'var(--accent)' : 'var(--bg-surface)',
                border: `2px solid ${isSelected ? 'var(--accent)' : !affordable ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 8,
                cursor: canPlay && affordable ? 'pointer' : 'default',
                opacity: canPlay && affordable ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 'bold',
                marginBottom: 4,
                color: isSelected ? '#fff' : 'var(--text)',
              }}>
                {def.name}
              </div>
              <div style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--muted)', marginBottom: 4 }}>
                {def.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{
                  color: def.energyCost > 0 ? '#e67e22' : 'var(--muted)',
                }}>
                  {def.energyCost}E
                </span>
                <span style={{
                  padding: '0 4px',
                  borderRadius: 3,
                  background: isSlot ? 'rgba(162,155,254,0.2)' : 'rgba(241,196,15,0.2)',
                  color: isSlot ? 'var(--accent)' : 'var(--gold)',
                  fontSize: 10,
                }}>
                  {isSlot ? def.category.modifier : 'System'}
                </span>
              </div>
              {def.keywords.length > 0 && (
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {def.keywords.join(', ')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
