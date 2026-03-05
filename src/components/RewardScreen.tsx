import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import { ALL_PARTS, ALL_EQUIPMENT } from '../data/parts'
import type { ResolvedDrop } from '../game/drops'

interface Props {
  drops: ResolvedDrop[]
  onChoose: (cardId?: string) => void
}

export default function RewardScreen({ drops, onChoose }: Props) {
  const cardDrops = drops.filter((d) => d.type === 'card')
  const shardDrop = drops.find((d) => d.type === 'shards')
  const partDrops = drops.filter((d) => d.type === 'part')
  const equipDrops = drops.filter((d) => d.type === 'equipment')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      gap: '24px',
      padding: '40px',
    }}>
      <h2 style={{ letterSpacing: '3px', color: '#a29bfe', marginBottom: 0 }}>REWARD</h2>

      {/* Drop summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {shardDrop && shardDrop.type === 'shards' && (
          <span style={{
            padding: '4px 12px',
            backgroundColor: 'rgba(241,196,15,0.15)',
            border: '1px solid #f1c40f',
            borderRadius: '6px',
            color: '#f1c40f',
            fontSize: '13px',
            fontWeight: 'bold',
          }}>
            +{shardDrop.amount} shards
          </span>
        )}
        {partDrops.map((d) => {
          if (d.type !== 'part') return null
          const name = ALL_PARTS[d.partId]?.name ?? d.partId
          return (
            <span key={d.partId} style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(46,204,113,0.15)',
              border: '1px solid #2ecc71',
              borderRadius: '6px',
              color: '#2ecc71',
              fontSize: '13px',
              fontWeight: 'bold',
            }}>
              Found: {name}
            </span>
          )
        })}
        {equipDrops.map((d) => {
          if (d.type !== 'equipment') return null
          const name = ALL_EQUIPMENT[d.equipmentId]?.name ?? d.equipmentId
          return (
            <span key={d.equipmentId} style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(52,152,219,0.15)',
              border: '1px solid #3498db',
              borderRadius: '6px',
              color: '#3498db',
              fontSize: '13px',
              fontWeight: 'bold',
            }}>
              Found: {name}
            </span>
          )
        })}
      </div>

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
      )}
    </div>
  )
}
