import { useRef, useState, useEffect } from 'react'
import type { PartDefinition, EquipableDefinition, EquipSlot, StatusEffect } from '../game/types'
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'

interface Props {
  health: number
  maxHealth: number
  energy: number
  energyCap: number
  block: number
  parts: PartDefinition[]
  equipables: Record<EquipSlot, EquipableDefinition | null>
  statusEffects: StatusEffect[]
}

export default function StillPanel({
  health, maxHealth, energy, energyCap, block, statusEffects,
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

      {/* Energy pips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {Array.from({ length: energyCap }, (_, i) => (
          <div
            key={i}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: i < energy ? '#f1c40f' : '#2c3e50',
              border: '1px solid #f1c40f',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
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
