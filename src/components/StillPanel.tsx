import { useRef, useState, useEffect } from 'react'
import type { StatusEffect } from '../game/types'
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'

interface Props {
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  block: number
  statusEffects: StatusEffect[]
  compact?: boolean
}

export default function StillPanel({
  health, maxHealth, energy, maxEnergy, block, statusEffects, compact,
}: Props) {
  const healthPct = Math.max(0, (health / maxHealth) * 100)
  const healthColor = healthPct > 50 ? '#27ae60' : healthPct > 25 ? '#f39c12' : '#c0392b'
  const prevHealthRef = useRef(health)
  const [damaged, setDamaged] = useState(false)
  const [damageKey, setDamageKey] = useState(0)

  useEffect(() => {
    if (health < prevHealthRef.current) {
      setDamaged(true)
      setDamageKey((k) => k + 1)
      const t = setTimeout(() => setDamaged(false), 400)
      prevHealthRef.current = health
      return () => clearTimeout(t)
    }
    prevHealthRef.current = health
  }, [health])

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#16213e',
        border: '1px solid #2c3e50',
        borderRadius: '6px',
        padding: '6px 12px',
        minHeight: '36px',
        color: '#e8e8e8',
        fontSize: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Mini HP bar + value */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '80px',
            height: '8px',
            backgroundColor: '#2c3e50',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div
              className={damaged ? 'health-bar-damaged' : ''}
              style={{
                height: '100%',
                width: `${healthPct}%`,
                backgroundColor: healthColor,
                borderRadius: '4px',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{health}/{maxHealth}</span>
          {damaged && (
            <span key={damageKey} className="damage-popup" style={{ top: '-16px', fontSize: '10px' }}>hit</span>
          )}
        </div>
        {/* Energy */}
        <span style={{ fontWeight: 'bold', color: '#e67e22' }}>
          E {energy}/{maxEnergy}
        </span>
        {/* Block */}
        {block > 0 && (
          <span style={{ color: '#74b9ff', fontWeight: 'bold' }}>Blk {block}</span>
        )}
        {/* Status pills */}
        {statusEffects.map((s) => (
          <span
            key={s.type}
            style={{
              fontSize: '10px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px',
              padding: '1px 5px',
              color: '#dfe6e9',
            }}
          >
            {s.type[0]}{s.stacks}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#16213e',
      border: '1px solid #2c3e50',
      borderRadius: '10px',
      padding: '16px',
      minWidth: '180px',
      color: '#e8e8e8',
    }}>
      {/* Sprite + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <Sprite art={STILL_SPRITE.art} palette={STILL_SPRITE.palette} pixelSize={4} />
        <div style={{
          fontWeight: 'bold',
          fontSize: '18px',
          letterSpacing: '2px',
          color: '#a29bfe',
        }}>
          STILL
        </div>
      </div>

      {/* Health bar */}
      <div style={{ marginBottom: '10px', position: 'relative' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
          HP {health} / {maxHealth}
        </div>
        <div style={{
          height: '10px',
          backgroundColor: '#2c3e50',
          borderRadius: '5px',
          overflow: 'hidden',
        }}>
          <div
            className={damaged ? 'health-bar-damaged' : ''}
            style={{
              height: '100%',
              width: `${healthPct}%`,
              backgroundColor: healthColor,
              borderRadius: '5px',
              transition: 'width 0.3s',
            }}
          />
        </div>
        {damaged && (
          <div key={damageKey} className="damage-popup" style={{ top: '-20px' }}>
            hit
          </div>
        )}
      </div>

      {/* Block */}
      {block > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
          color: '#74b9ff',
          fontSize: '13px',
        }}>
          <span>Shield</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{block}</span>
        </div>
      )}

      {/* Energy indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '13px',
      }}>
        <span style={{ color: '#aaa' }}>Energy</span>
        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#e67e22' }}>
          {energy} / {maxEnergy}
        </span>
      </div>

      {/* Status effects */}
      {statusEffects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
          {statusEffects.map((s) => (
            <span
              key={s.type}
              style={{
                fontSize: '10px',
                backgroundColor: '#2c3e50',
                borderRadius: '4px',
                padding: '2px 6px',
                color: '#dfe6e9',
              }}
            >
              {s.type} {s.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
