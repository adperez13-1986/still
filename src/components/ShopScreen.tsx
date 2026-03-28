import { useMemo, useState } from 'react'
import CardDisplay from './CardDisplay'
import CardPicker from './CardPicker'
import RunInfoOverlay from './RunInfoOverlay'
import { SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import { rollWeightedCards } from '../game/drops'
import { PARTS } from '../data/parts'
import type { CardInstance, BehavioralPartDefinition, EquipmentDefinition, BodySlot } from '../game/types'
import { MAX_PARTS } from '../game/types'

const RECYCLE_COST = 60

interface Props {
  shards: number
  sector: number
  deck: CardInstance[]
  ownedPartIds: string[]
  parts: BehavioralPartDefinition[]
  equipment: Record<BodySlot, EquipmentDefinition | null>
  onBuyCard: (cardId: string, cost: number) => void
  onBuyPart: (partId: string, cost: number) => void
  onReplacePart: (oldPartId: string, newPartId: string, cost: number) => void
  onRecycle: (instanceId: string) => void
  onLeave: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const CARD_COSTS: Record<string, number> = {
  rare: 75, uncommon: 55, common: 40,
}
const PART_COSTS: Record<string, number> = {
  rare: 90, uncommon: 65, common: 45,
}

export default function ShopScreen({ shards, sector, deck, ownedPartIds, parts, equipment, onBuyCard, onBuyPart, onReplacePart, onRecycle, onLeave }: Props) {
  const [showRecyclePicker, setShowRecyclePicker] = useState(false)
  const [purchasedPartIds, setPurchasedPartIds] = useState<string[]>([])
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)
  const [pendingPartReplace, setPendingPartReplace] = useState<{ partId: string; cost: number } | null>(null)
  const SHOP_CARDS = useMemo(() => {
    return rollWeightedCards(SECTOR1_CARD_POOL, SECTOR2_CARD_POOL, 3, sector)
  }, [sector])
  const SHOP_PARTS = useMemo(() => {
    const available = PARTS.filter(p => !ownedPartIds.includes(p.id))
    return shuffle(available).slice(0, 2)
  }, [ownedPartIds])

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '900px' }}>
        <h2 style={{ letterSpacing: '3px', color: '#f39c12', margin: 0 }}>SHOP</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setInfoTab('deck')}
            style={{
              background: 'none',
              border: '1px solid #2c3e50',
              color: '#888',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            INFO
          </button>
          <span style={{ color: '#f1c40f', fontSize: '16px', fontWeight: 'bold' }}>
            {shards} shards
          </span>
        </div>
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
        <h3 style={{ color: '#aaa', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>MODS</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SHOP_PARTS.map((part) => {
            const cost = PART_COSTS[part.rarity]
            const sold = purchasedPartIds.includes(part.id)
            const atCapacity = parts.length >= MAX_PARTS
            const canAfford = shards >= cost && !sold
            return (
              <div
                key={part.id}
                onClick={() => {
                  if (!canAfford || sold) return
                  if (atCapacity) {
                    setPendingPartReplace({ partId: part.id, cost })
                    return
                  }
                  onBuyPart(part.id, cost)
                  setPurchasedPartIds(prev => [...prev, part.id])
                }}
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
                <div style={{ fontSize: '12px', color: sold ? '#27ae60' : canAfford ? '#f1c40f' : '#555', fontWeight: 'bold' }}>
                  {sold ? 'SOLD' : `${cost} shards`}
                </div>
              </div>
            )
          })}
        </div>
      </div>


      {/* Recycler */}
      <div>
        <h3 style={{ color: '#aaa', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>RECYCLER</h3>
        <button
          onClick={() => shards >= RECYCLE_COST && setShowRecyclePicker(true)}
          disabled={shards < RECYCLE_COST}
          style={{
            padding: '10px 28px',
            backgroundColor: shards >= RECYCLE_COST ? '#e74c3c' : '#2c3e50',
            color: shards >= RECYCLE_COST ? '#fff' : '#555',
            border: 'none',
            borderRadius: '6px',
            cursor: shards >= RECYCLE_COST ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          Recycle a card — {RECYCLE_COST} shards
        </button>
      </div>

      {showRecyclePicker && (
        <CardPicker
          deck={deck}
          onSelect={(instanceId) => {
            onRecycle(instanceId)
            setShowRecyclePicker(false)
          }}
          onCancel={() => setShowRecyclePicker(false)}
        />
      )}

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

      {infoTab && (
        <RunInfoOverlay
          tab={infoTab}
          deck={deck}
          parts={parts}
          equipment={equipment}
          onClose={() => setInfoTab(null)}
          onTabChange={setInfoTab}
        />
      )}

      {pendingPartReplace && (() => {
        const incoming = PARTS.find(p => p.id === pendingPartReplace.partId)
        if (!incoming) return null
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}>
            <div style={{
              backgroundColor: '#1e1e2e', border: '2px solid #4a4a6a', borderRadius: '12px',
              padding: '20px', maxWidth: '340px', width: '90%', color: '#e8e8e8',
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', color: '#f39c12' }}>
                Mods Full (4/4)
              </div>
              <div style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>Buying:</div>
              <div style={{
                padding: '8px', backgroundColor: 'rgba(243,156,18,0.15)', border: '1px solid #f39c12',
                borderRadius: '6px', marginBottom: '12px',
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{incoming.name}</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{incoming.description}</div>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>Replace one:</div>
              {parts.map(part => (
                <div
                  key={part.id}
                  onClick={() => {
                    onReplacePart(part.id, pendingPartReplace.partId, pendingPartReplace.cost)
                    setPurchasedPartIds(prev => [...prev, pendingPartReplace.partId])
                    setPendingPartReplace(null)
                  }}
                  style={{
                    padding: '8px', marginBottom: '4px', backgroundColor: '#16213e',
                    border: '1px solid #2c3e50', borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{part.name}</div>
                  <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{part.description}</div>
                </div>
              ))}
              <div
                onClick={() => setPendingPartReplace(null)}
                style={{
                  padding: '8px', marginTop: '8px', textAlign: 'center',
                  backgroundColor: '#2c3e50', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '12px', color: '#aaa',
                }}
              >
                Cancel
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
