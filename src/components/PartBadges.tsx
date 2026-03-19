import { useState } from 'react'
import type { BehavioralPartDefinition } from '../game/types'

const RARITY_COLORS: Record<string, string> = {
  common: '#888',
  uncommon: '#74b9ff',
  rare: '#f1c40f',
}

// Map part effect type → glow color
function getGlowColor(part: BehavioralPartDefinition): string {
  switch (part.effect.type) {
    case 'bonusBlock':
    case 'blockPerCard':
    case 'blockForDisabledSlots':
    case 'blockPerExhausted':
    case 'blockPerUnplayedCard':
    case 'halveLargeDamage':
      return '#3498db'
    case 'damageRandomEnemy':
    case 'bonusDamage':
      return '#e74c3c'
    default:
      return '#ddd'
  }
}

// Generate 2-letter abbreviation from part name
function getAbbrev(name: string): string {
  const words = name.split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

interface PartBadgesProps {
  parts: BehavioralPartDefinition[]
  activePartIds: Set<string>
}

export default function PartBadges({ parts, activePartIds }: PartBadgesProps) {
  const [popupPart, setPopupPart] = useState<BehavioralPartDefinition | null>(null)

  if (parts.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '6px 8px',
      }}>
        {parts.map((part) => {
          const isActive = activePartIds.has(part.id)
          const glowColor = getGlowColor(part)
          const borderColor = RARITY_COLORS[part.rarity] ?? '#888'

          return (
            <div
              key={part.id}
              onClick={() => setPopupPart(popupPart?.id === part.id ? null : part)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: `2px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: isActive ? '#fff' : '#aaa',
                backgroundColor: isActive ? `${glowColor}33` : '#16213e',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'box-shadow 0.15s, color 0.15s, background-color 0.15s',
                boxShadow: isActive
                  ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}88`
                  : 'none',
              }}
            >
              {getAbbrev(part.name)}
            </div>
          )
        })}
      </div>

      {/* Tap-to-info popup */}
      {popupPart && (
        <>
          <div
            onClick={() => setPopupPart(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1a1a2e',
            border: `1px solid ${RARITY_COLORS[popupPart.rarity] ?? '#555'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            zIndex: 100,
            minWidth: '200px',
            maxWidth: '280px',
            marginBottom: '6px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e8e8e8' }}>
                {popupPart.name}
              </span>
              <span style={{
                fontSize: '9px',
                color: RARITY_COLORS[popupPart.rarity],
                letterSpacing: '1px',
              }}>
                {popupPart.rarity.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', lineHeight: '1.4' }}>
              {popupPart.description}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
