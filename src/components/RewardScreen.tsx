import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import type { ResolvedDrop } from '../game/drops'

interface Props {
  drops: ResolvedDrop[]
  onChoose: (cardId?: string) => void
}

export default function RewardScreen({ drops, onChoose }: Props) {
  const cardDrops = drops.filter((d) => d.type === 'card')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      gap: '32px',
      padding: '40px',
    }}>
      <h2 style={{ letterSpacing: '3px', color: '#a29bfe', marginBottom: 0 }}>REWARD</h2>

      {cardDrops.length > 0 ? (
        <>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: 0 }}>
            Choose a card to add to your deck:
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {cardDrops.map((drop) => {
              if (drop.type !== 'card') return null
              const def = ALL_CARDS[drop.cardId]
              if (!def) return null
              return (
                <CardDisplay
                  key={drop.cardId}
                  card={def}
                  onClick={() => onChoose(drop.cardId)}
                />
              )
            })}
          </div>

          <button
            onClick={() => onChoose(undefined)}
            style={{
              padding: '10px 32px',
              backgroundColor: 'transparent',
              border: '1px solid #555',
              color: '#888',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Skip
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
            Shards collected. Keep moving.
          </p>
          <button
            onClick={() => onChoose(undefined)}
            style={{
              padding: '12px 48px',
              backgroundColor: '#16213e',
              border: '1px solid #a29bfe',
              color: '#a29bfe',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            Continue
          </button>
        </>
      )}
    </div>
  )
}
