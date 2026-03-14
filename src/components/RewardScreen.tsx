import { useState, useRef, useCallback } from 'react'
import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import { ALL_PARTS, ALL_EQUIPMENT } from '../data/parts'
import type { ResolvedDrop } from '../game/drops'

interface Props {
  drops: ResolvedDrop[]
  onChoose: (cardId?: string, skippedPartIds?: string[], skippedEquipIds?: string[]) => void
}

function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const start = useCallback(() => {
    firedRef.current = false
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress()
    }, ms)
  }, [onLongPress, ms])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    didFire: () => firedRef.current,
  }
}

interface DetailPopover {
  name: string
  description: string
  slot?: string
  color: string
}

export default function RewardScreen({ drops, onChoose }: Props) {
  const cardDrops = drops.filter((d) => d.type === 'card')
  const shardDrop = drops.find((d) => d.type === 'shards')
  const allPartDrops = drops.filter((d) => d.type === 'part')
  const allEquipDrops = drops.filter((d) => d.type === 'equipment')
  // Parts/equipment are opt-out: start accepted, player can skip
  const [acceptedParts, setAcceptedParts] = useState<Set<string>>(() => new Set(allPartDrops.filter(d => d.type === 'part').map(d => d.type === 'part' ? d.partId : '')))
  const [acceptedEquips, setAcceptedEquips] = useState<Set<string>>(() => new Set(allEquipDrops.filter(d => d.type === 'equipment').map(d => d.type === 'equipment' ? d.equipmentId : '')))
  const skippedParts = new Set(allPartDrops.filter(d => d.type === 'part' && !acceptedParts.has(d.partId)).map(d => d.type === 'part' ? d.partId : ''))
  const skippedEquips = new Set(allEquipDrops.filter(d => d.type === 'equipment' && !acceptedEquips.has(d.equipmentId)).map(d => d.type === 'equipment' ? d.equipmentId : ''))
  const [detail, setDetail] = useState<DetailPopover | null>(null)

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
        {allPartDrops.map((d) => {
          if (d.type !== 'part') return null
          const part = ALL_PARTS[d.partId]
          if (!part) return null
          const isAccepted = acceptedParts.has(d.partId)
          return (
            <DropBadge
              key={d.partId}
              label={isAccepted ? `Taking: ${part.name}` : `Found: ${part.name}`}
              color={isAccepted ? '#2ecc71' : '#888'}
              onLongPress={() => setDetail({
                name: part.name,
                description: part.description,
                color: '#2ecc71',
              })}
              onToggle={() => {
                setAcceptedParts(prev => {
                  const next = new Set(prev)
                  if (next.has(d.partId)) next.delete(d.partId)
                  else next.add(d.partId)
                  return next
                })
              }}
              accepted={isAccepted}
            />
          )
        })}
        {allEquipDrops.map((d) => {
          if (d.type !== 'equipment') return null
          const equip = ALL_EQUIPMENT[d.equipmentId]
          if (!equip) return null
          const isAccepted = acceptedEquips.has(d.equipmentId)
          return (
            <DropBadge
              key={d.equipmentId}
              label={isAccepted ? `Taking: ${equip.name}` : `Found: ${equip.name}`}
              color={isAccepted ? '#3498db' : '#888'}
              onLongPress={() => setDetail({
                name: equip.name,
                description: equip.description,
                slot: equip.slot,
                color: '#3498db',
              })}
              onToggle={() => {
                setAcceptedEquips(prev => {
                  const next = new Set(prev)
                  if (next.has(d.equipmentId)) next.delete(d.equipmentId)
                  else next.add(d.equipmentId)
                  return next
                })
              }}
              accepted={isAccepted}
            />
          )
        })}
      </div>

      {/* Detail popover */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a2e',
              border: `1px solid ${detail.color}`,
              borderRadius: '10px',
              padding: '20px 24px',
              maxWidth: '320px',
              width: '90%',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: detail.color, marginBottom: '4px' }}>
              {detail.name}
            </div>
            {detail.slot && (
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                {detail.slot} slot
              </div>
            )}
            <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.6' }}>
              {detail.description}
            </div>
            <button
              onClick={() => setDetail(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                border: `1px solid ${detail.color}`,
                color: detail.color,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
                  onClick={() => onChoose(drop.cardId, [...skippedParts], [...skippedEquips])}
                />
              )
            })}
          </div>

          <button
            onClick={() => onChoose(undefined, [...skippedParts], [...skippedEquips])}
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
            No Card
          </button>
        </>
      ) : (
        <button
          onClick={() => onChoose(undefined, [...skippedParts], [...skippedEquips])}
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

function DropBadge({ label, color, onLongPress, onToggle, accepted }: {
  label: string
  color: string
  onLongPress: () => void
  onToggle?: () => void
  accepted?: boolean
}) {
  const { didFire, ...lp } = useLongPress(onLongPress)

  return (
    <span
      onClick={() => {
        if (!didFire() && onToggle) onToggle()
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        backgroundColor: `${color}15`,
        border: `1px solid ${color}`,
        borderRadius: '6px',
        color,
        fontSize: '13px',
        fontWeight: 'bold',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: onToggle ? 'pointer' : 'default',
      }}
      {...lp}
    >
      <span>
        {label}
        <span style={{ fontSize: '10px', color: '#888', marginLeft: '6px' }}>
          {accepted ? 'tap to skip · hold for details' : 'tap to take'}
        </span>
      </span>
    </span>
  )
}
