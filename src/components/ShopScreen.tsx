import CardDisplay from './CardDisplay'
import { ACT1_CARD_POOL } from '../data/cards'
import { PARTS } from '../data/parts'
import type { CardDefinition, PartDefinition } from '../game/types'

interface Props {
  shards: number
  onBuyCard: (cardId: string, cost: number) => void
  onBuyPart: (partId: string, cost: number) => void
  onLeave: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const SHOP_CARDS: CardDefinition[] = shuffle(ACT1_CARD_POOL).slice(0, 3)
const SHOP_PARTS: PartDefinition[] = shuffle(PARTS).slice(0, 2)

const CARD_COSTS: Record<string, number> = {
  rare: 75, uncommon: 55, common: 40,
}
const PART_COSTS: Record<string, number> = {
  rare: 90, uncommon: 65, common: 45,
}

export default function ShopScreen({ shards, onBuyCard, onBuyPart, onLeave }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      padding: '40px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '900px' }}>
        <h2 style={{ letterSpacing: '3px', color: '#f39c12', margin: 0 }}>SHOP</h2>
        <span style={{ color: '#f1c40f', fontSize: '16px', fontWeight: 'bold' }}>
          {shards} shards
        </span>
      </div>

      <p style={{ color: '#888', fontSize: '13px' }}>
        A still corner of the maze. Things left behind by others. Or for you. Hard to say.
      </p>

      {/* Cards */}
      <div>
        <h3 style={{ color: '#aaa', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>CARDS</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SHOP_CARDS.map((card) => {
            const cost = CARD_COSTS['common']
            const canAfford = shards >= cost
            return (
              <div key={card.id} style={{ textAlign: 'center' }}>
                <CardDisplay card={card} disabled={!canAfford} onClick={() => canAfford && onBuyCard(card.id, cost)} />
                <div style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: canAfford ? '#f1c40f' : '#555',
                  fontWeight: 'bold',
                }}>
                  {cost} shards
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Parts */}
      <div>
        <h3 style={{ color: '#aaa', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>PARTS</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SHOP_PARTS.map((part) => {
            const cost = PART_COSTS[part.rarity]
            const canAfford = shards >= cost
            return (
              <div
                key={part.id}
                onClick={() => canAfford && onBuyPart(part.id, cost)}
                style={{
                  backgroundColor: '#16213e',
                  border: `1px solid ${canAfford ? '#a29bfe' : '#333'}`,
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5,
                  minWidth: '200px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{part.name}</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>{part.description}</div>
                <div style={{ fontSize: '12px', color: canAfford ? '#f1c40f' : '#555', fontWeight: 'bold' }}>
                  {cost} shards
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onLeave}
        style={{
          padding: '10px 32px',
          background: 'none',
          border: '1px solid #555',
          color: '#888',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          marginTop: '12px',
        }}
      >
        Leave
      </button>
    </div>
  )
}
