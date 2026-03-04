import { useState } from 'react'
import CardDisplay from './CardDisplay'
import type { CardInstance, CardDefinition } from '../game/types'

interface Props {
  hand: CardInstance[]
  cardDefs: Record<string, CardDefinition>
  energy: number
  playerTurn: boolean
  onPlayCard: (instanceId: string, def: CardDefinition) => void
}

export default function Hand({ hand, cardDefs, energy, playerTurn, onPlayCard }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const resolveDef = (instance: CardInstance) => {
    const base = cardDefs[instance.definitionId]
    if (!base) return null
    return instance.isUpgraded && base.upgraded ? base.upgraded : base
  }

  const handleCardClick = (instance: CardInstance) => {
    const def = resolveDef(instance)
    if (!def) return
    if (!playerTurn || def.cost > energy) return

    if (selectedId === instance.instanceId) {
      // Second click on selected card — play it
      onPlayCard(instance.instanceId, def)
      setSelectedId(null)
    } else {
      setSelectedId(instance.instanceId)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      justifyContent: 'center',
      padding: '12px',
      minHeight: '180px',
      alignItems: 'flex-end',
    }}>
      {hand.map((instance) => {
        const def = resolveDef(instance)
        if (!def) return null
        const canPlay = playerTurn && def.cost <= energy
        return (
          <CardDisplay
            key={instance.instanceId}
            card={def}
            instanceId={instance.instanceId}
            disabled={!canPlay}
            selected={selectedId === instance.instanceId}
            onClick={() => handleCardClick(instance)}
          />
        )
      })}
      {hand.length === 0 && (
        <div style={{ color: '#555', fontSize: '14px', alignSelf: 'center' }}>
          No cards in hand
        </div>
      )}
    </div>
  )
}
