import { useState } from 'react'
import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import type { CardInstance } from '../game/types'

interface Props {
  deck: CardInstance[]
  onSelect: (instanceId: string) => void
  onCancel: () => void
}

export default function CardPicker({ deck, onSelect, onCancel }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      overflow: 'auto',
    }}>
      <h3 style={{
        color: '#e8e8e8',
        fontSize: '14px',
        letterSpacing: '2px',
        marginBottom: '20px',
      }}>
        CHOOSE A CARD TO REMOVE
      </h3>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        maxWidth: '600px',
        marginBottom: '24px',
      }}>
        {deck.map((inst) => {
          const def = ALL_CARDS[inst.definitionId]
          if (!def) return null
          const card = inst.isUpgraded && def.upgraded ? def.upgraded : def
          return (
            <CardDisplay
              key={inst.instanceId}
              card={card}
              selected={selectedId === inst.instanceId}
              onClick={() => setSelectedId(
                selectedId === inst.instanceId ? null : inst.instanceId
              )}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {selectedId && (
          <button
            onClick={() => onSelect(selectedId)}
            style={{
              padding: '10px 28px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            Remove
          </button>
        )}
        <button
          onClick={onCancel}
          style={{
            padding: '10px 28px',
            background: 'none',
            border: '1px solid #555',
            color: '#888',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
