// REFERENCE — drop-in replacement for src/components/EnemyCard.tsx
//
// Same Props interface, same exports, same imports. The compact branch (mobile)
// is unchanged from the existing file. Only the desktop branch (the !compact
// return at the bottom) is redesigned per SPEC.md.
//
// Two new props are added (both optional, backwards-compatible):
//   - depth?: number      // 0..0.9, controls scale + brightness (set by EnemyStage)
//   - shift?: number      // px horizontal jitter (set by EnemyStage)
//   - onLongPress?: () => void   // open inspector

import { useRef } from 'react'
import type { EnemyInstance, EnemyDefinition, Intent, StatusEffectType } from '../game/types'
import { getStatus } from '../game/combat'
import Sprite from './Sprite'
import { getEnemySprite } from '../data/sprites'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  selected?: boolean
  recentDamage?: number
  onClick?: () => void
  onLongPress?: () => void
  compact?: boolean
  combatsCleared?: number
  depth?: number     // 0 = front, up to 0.9 = back
  shift?: number     // horizontal jitter in px
}

const INTENT_ICONS: Record<string, string> = {
  Attack: '⚔', Block: '◆', Buff: '↑', Debuff: '↓',
  AttackDebuff: '⚔↓', DisableSlot: '🔒', Scan: '👁',
}

const INTENT_COLORS: Record<string, string> = {
  Attack: '#e74c3c', Block: '#3498db', Buff: '#2ecc71', Debuff: '#e67e22',
  AttackDebuff: '#c0392b', DisableSlot: '#636e72', Scan: '#a29bfe',
}

const STATUS_DOT_COLORS: Record<StatusEffectType, string> = {
  Weak: '#e67e22',
  Vulnerable: '#e74c3c',
  Strength: '#27ae60',
  Dexterity: '#3498db',
  Inspired: '#f1c40f',
}

function getEffectiveDamage(intent: Intent, enemy: EnemyInstance, isBoss: boolean, combatsCleared: number): number {
  let dmg = intent.value
  const scalingMultiplier = isBoss ? 1.15 : 1 + combatsCleared * 0.05
  dmg = Math.floor(dmg * scalingMultiplier)
  dmg += getStatus(enemy.statusEffects, 'Strength')
  if (getStatus(enemy.statusEffects, 'Weak') > 0) dmg = Math.floor(dmg * 0.75)
  return Math.max(0, dmg)
}

// ─── Compact (mobile) ─── unchanged from prior implementation ───────────────
// (kept verbatim from the existing EnemyCard.tsx — do not change this branch)
//
// In the actual replacement, paste the existing compact branch here unchanged.
// It's omitted from this reference file for clarity. The new code is below.

function CompactBranch(_props: Props) {
  // <<< paste the existing 'if (compact) { return ( ... ) }' body here unchanged >>>
  return null
}

// ─── Diorama (desktop) — NEW design ─────────────────────────────────────────

function GlyphRow({ instance, definition, intent, effectiveDmg }: {
  instance: EnemyInstance
  definition: EnemyDefinition
  intent: Intent | undefined
  effectiveDmg: number | undefined
}) {
  if (!intent) return <div style={{ minHeight: 16 }} />

  const color = INTENT_COLORS[intent.type] ?? '#aaa'
  const icon = INTENT_ICONS[intent.type] ?? '?'

  let chipText = ''
  if (intent.type === 'Scan') chipText = 'SCN'
  else if (intent.type === 'DisableSlot') chipText = (intent.targetSlot ?? '?').slice(0, 2)
  else if (intent.type === 'Attack' || intent.type === 'AttackDebuff') chipText = String(effectiveDmg ?? intent.value)
  else chipText = String(intent.value)

  if (intent.hits && intent.hits > 1) chipText += `×${intent.hits}`

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      minHeight: 16,
      marginBottom: 4,
      // boss/elite name hint via colored top-edge — keeps name out of the stage
      borderTop: definition.isBoss
        ? '1px solid #e74c3c'
        : definition.isElite
          ? '1px solid #e67e22'
          : 'none',
      paddingTop: definition.isBoss || definition.isElite ? 2 : 0,
    }}>
      <span style={{
        fontSize: 11,
        color,
        fontWeight: 'bold',
        lineHeight: 1,
      }}>
        {icon}
      </span>
      <span style={{
        fontSize: 10,
        fontWeight: 'bold',
        color: '#e8e8e8',
        background: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${color}`,
        borderRadius: 3,
        padding: '1px 4px',
        lineHeight: 1,
      }}>
        {chipText}
      </span>
      {instance.block > 0 && (
        <span style={{
          fontSize: 10,
          fontWeight: 'bold',
          color: '#74b9ff',
          lineHeight: 1,
        }}>
          ◆{instance.block}
        </span>
      )}
      {instance.statusEffects.map(s => (
        <span
          key={s.type}
          title={`${s.type} ${s.stacks}`}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: STATUS_DOT_COLORS[s.type] ?? '#aaa',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  )
}

function HpLine({ instance }: { instance: EnemyInstance }) {
  const pct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)
  if (pct >= 100) return null   // hide at full HP for clean stage
  return (
    <div style={{
      width: 36,
      height: 3,
      background: '#2c3e50',
      marginTop: 4,
      borderRadius: 1,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: '#e74c3c',
        transition: 'width 0.3s',
      }} />
    </div>
  )
}

export default function EnemyCard(props: Props) {
  const {
    instance, definition, selected, onClick, onLongPress,
    compact, combatsCleared = 0, depth = 0, shift = 0,
  } = props

  if (compact) return CompactBranch(props)

  const rawIntent = definition.intentPattern[
    instance.intentIndex % definition.intentPattern.length
  ]
  const isAttack = rawIntent?.type === 'Attack' || rawIntent?.type === 'AttackDebuff'
  const effectiveDmg = rawIntent && isAttack
    ? getEffectiveDamage(rawIntent, instance, !!definition.isBoss, combatsCleared)
    : undefined

  const sprite = getEnemySprite(definition.id)
  const depthScale = 1 - depth * 0.27

  // Long-press detection
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moved = useRef(false)
  const startPt = useRef({ x: 0, y: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    if (instance.isDefeated) return
    moved.current = false
    startPt.current = { x: e.clientX, y: e.clientY }
    pressTimer.current = setTimeout(() => {
      if (!moved.current) onLongPress?.()
      pressTimer.current = null
    }, 380)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - startPt.current.x
    const dy = e.clientY - startPt.current.y
    if (dx * dx + dy * dy > 64) {  // 8px movement threshold
      moved.current = true
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
      }
    }
  }
  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }
  const onClickHandler = () => {
    if (instance.isDefeated) return
    // If long-press already fired, suppress the click
    if (!pressTimer.current && moved.current) return
    onClick?.()
  }

  return (
    <div
      onClick={onClickHandler}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onPointerLeave={cancelPress}
      onContextMenu={(e) => {
        e.preventDefault()
        if (!instance.isDefeated) onLongPress?.()
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: instance.isDefeated ? 'default' : 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // depth-driven transform/filter
        transform: `translateX(${shift}px) scale(${depthScale})`,
        transformOrigin: 'bottom center',
        filter: instance.isDefeated
          ? 'grayscale(1)'
          : `brightness(${1 - depth * 0.15})`,
        opacity: instance.isDefeated ? 0.25 : 1,
        transition: 'transform 0.3s, filter 0.3s, opacity 0.3s',
        animation: instance.isDefeated ? 'none' : 'enemy-bob 3s ease-in-out infinite',
        animationDelay: `${(depth * 1.5).toFixed(2)}s`,
      }}
    >
      {/* Target caret */}
      {selected && !instance.isDefeated && (
        <div style={{
          position: 'absolute',
          top: -14,
          fontSize: 10,
          color: '#f1c40f',
          fontWeight: 'bold',
          lineHeight: 1,
          textShadow: '0 0 4px rgba(241, 196, 15, 0.8)',
        }}>
          ▾
        </div>
      )}

      {!instance.isDefeated && (
        <GlyphRow
          instance={instance}
          definition={definition}
          intent={rawIntent}
          effectiveDmg={effectiveDmg}
        />
      )}

      <div style={{
        filter: selected && !instance.isDefeated
          ? 'drop-shadow(0 0 6px #f1c40f)'
          : 'none',
        transition: 'filter 0.2s',
      }}>
        <Sprite art={sprite.art} palette={sprite.palette} pixelSize={4} />
      </div>

      {!instance.isDefeated && <HpLine instance={instance} />}

      {/* Floor shadow */}
      <div style={{
        width: `${36 * depthScale}px`,
        height: 4,
        marginTop: 2,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
      }} />
    </div>
  )
}

// Add to your global CSS (or App.css):
//
// @keyframes enemy-bob {
//   0%, 100% { translate: 0 0; }
//   50%      { translate: 0 -2px; }
// }
