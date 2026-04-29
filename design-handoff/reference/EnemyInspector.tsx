// REFERENCE — new file, drop at src/components/EnemyInspector.tsx
//
// Long-press popover that shows full enemy details (name, HP, intent, statuses).
// Anchored to the screen via fixed positioning at the pointer location.
// Closes on outside click, Escape, or click on the same enemy again.

import { useEffect, useRef } from 'react'
import type { EnemyInstance, EnemyDefinition, Intent, StatusEffectType } from '../game/types'
import { getStatus } from '../game/combat'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  combatsCleared: number
  anchor: { x: number; y: number }   // viewport coords
  onClose: () => void
}

const INTENT_ICONS: Record<string, string> = {
  Attack: 'sword', Block: 'shield', Buff: 'up', Debuff: 'down',
  AttackDebuff: 'sword+', DisableSlot: 'lock', Scan: 'eye',
}
const INTENT_COLORS: Record<string, string> = {
  Attack: '#e74c3c', Block: '#3498db', Buff: '#2ecc71', Debuff: '#e67e22',
  AttackDebuff: '#c0392b', DisableSlot: '#636e72', Scan: '#a29bfe',
}
const STATUS_LABELS: Record<StatusEffectType, string> = {
  Weak: 'Weak', Vulnerable: 'Vulnerable', Strength: 'Strength',
  Dexterity: 'Dexterity', Inspired: 'Inspired',
}

function getEffectiveDamage(intent: Intent, enemy: EnemyInstance, isBoss: boolean, combatsCleared: number): number {
  let dmg = intent.value
  const scalingMultiplier = isBoss ? 1.15 : 1 + combatsCleared * 0.05
  dmg = Math.floor(dmg * scalingMultiplier)
  dmg += getStatus(enemy.statusEffects, 'Strength')
  if (getStatus(enemy.statusEffects, 'Weak') > 0) dmg = Math.floor(dmg * 0.75)
  return Math.max(0, dmg)
}

export default function EnemyInspector({ instance, definition, combatsCleared, anchor, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Close on outside click
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Defer one frame so the opening tap doesn't immediately close it
    const t = setTimeout(() => window.addEventListener('pointerdown', onDown), 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [onClose])

  const intent = definition.intentPattern[
    instance.intentIndex % definition.intentPattern.length
  ]
  const isAttack = intent?.type === 'Attack' || intent?.type === 'AttackDebuff'
  const effectiveDmg = intent && isAttack
    ? getEffectiveDamage(intent, instance, !!definition.isBoss, combatsCleared)
    : undefined

  const healthPct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)

  // Position: clamp to viewport
  const PANEL_W = 240
  const PANEL_H = 200  // estimate
  const margin = 8
  let left = anchor.x + 12
  let top = anchor.y - 12
  if (left + PANEL_W + margin > window.innerWidth) left = anchor.x - PANEL_W - 12
  if (top + PANEL_H + margin > window.innerHeight) top = window.innerHeight - PANEL_H - margin
  if (top < margin) top = margin

  const intentColor = intent ? (INTENT_COLORS[intent.type] ?? '#aaa') : '#aaa'
  const intentIcon = intent ? (INTENT_ICONS[intent.type] ?? '?') : '?'

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left,
        top,
        width: PANEL_W,
        background: '#1e1e2e',
        border: '1px solid #4a4a6a',
        borderRadius: 8,
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        fontSize: 12,
        color: '#e8e8e8',
        animation: 'inspector-in 120ms ease-out',
      }}
    >
      {/* Name + tier chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: 14,
          color: definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : '#e8e8e8',
        }}>
          {definition.name}
        </span>
        {definition.isBoss && <span style={tierChip('#e74c3c')}>BOSS</span>}
        {definition.isElite && !definition.isBoss && <span style={tierChip('#e67e22')}>ELITE</span>}
      </div>

      {/* HP */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 3 }}>
          <span>HP</span>
          <span>{instance.currentHealth} / {instance.maxHealth}</span>
        </div>
        <div style={{ height: 6, background: '#2c3e50', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${healthPct}%`,
            background: '#e74c3c',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Block */}
      {instance.block > 0 && (
        <div style={{ fontSize: 11, color: '#74b9ff', marginBottom: 8 }}>
          Shield <span style={{ fontWeight: 'bold' }}>{instance.block}</span>
        </div>
      )}

      {/* Intent */}
      {!instance.isDefeated && intent && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 3, letterSpacing: 1 }}>NEXT</div>
          {intent.type === 'Scan' ? (
            <div style={{ fontSize: 12, color: '#a29bfe', fontStyle: 'italic', fontWeight: 'bold' }}>
              Scanning...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: intentColor, fontSize: 12 }}>
              <span style={{ fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' }}>[{intentIcon}]</span>
              <span style={{ fontWeight: 'bold' }}>
                {intent.type === 'DisableSlot'
                  ? intent.targetSlot ?? '?'
                  : (isAttack && effectiveDmg != null ? effectiveDmg : intent.value)}
                {intent.hits && intent.hits > 1 ? `×${intent.hits}` : ''}
              </span>
              {intent.status && (
                <span style={{ fontSize: 10, color: '#aaa' }}>
                  +{intent.status} {intent.statusStacks ?? 1}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statuses */}
      {instance.statusEffects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {instance.statusEffects.map(s => (
            <span key={s.type} style={{
              fontSize: 10,
              background: '#2c3e50',
              color: '#dfe6e9',
              padding: '2px 6px',
              borderRadius: 3,
            }}>
              {STATUS_LABELS[s.type]} {s.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function tierChip(color: string): React.CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 'bold',
    color,
    border: `1px solid ${color}`,
    borderRadius: 3,
    padding: '1px 4px',
    letterSpacing: 1,
  }
}

// Add to global CSS:
//
// @keyframes inspector-in {
//   from { opacity: 0; transform: translateY(-4px); }
//   to   { opacity: 1; transform: translateY(0); }
// }
