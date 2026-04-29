import { useRef, useState } from 'react'
import type { EnemyInstance, EnemyDefinition, Intent, StatusEffectType } from '../game/types'
import { getStatus } from '../game/combat'
import Sprite from './Sprite'
import { getEnemySprite } from '../data/sprites'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  selected?: boolean
  combatsCleared?: number
  depth: number
  shift: number
  onClick?: () => void
  onLongPress?: () => void
}

const KIND_COLORS: Record<string, { glyph: string; ring: string; bg: string }> = {
  attack: { glyph: '#e74c3c', ring: 'rgba(231,76,60,0.55)',  bg: 'rgba(231,76,60,0.15)' },
  block:  { glyph: '#74b9ff', ring: 'rgba(116,185,255,0.55)', bg: 'rgba(116,185,255,0.15)' },
  buff:   { glyph: '#f1c40f', ring: 'rgba(241,196,15,0.55)',  bg: 'rgba(241,196,15,0.15)' },
  debuff: { glyph: '#c39bd3', ring: 'rgba(195,155,211,0.55)', bg: 'rgba(195,155,211,0.15)' },
  other:  { glyph: '#b2a4f5', ring: 'rgba(178,164,245,0.55)', bg: 'rgba(178,164,245,0.15)' },
}

const INTENT_KIND: Record<string, keyof typeof KIND_COLORS> = {
  Attack: 'attack', AttackDebuff: 'attack', Retaliate: 'attack', StrainScale: 'attack',
  Charge: 'attack', Leech: 'attack', Enrage: 'attack', BerserkerAttack: 'attack',
  PhaseShift: 'attack', MartyrHeal: 'attack',
  Block: 'block', ShieldAllies: 'block', StealBlock: 'block',
  Buff: 'buff', ConditionalBuff: 'buff',
  Debuff: 'debuff', StrainTick: 'debuff', DisableSlot: 'debuff', CopyAction: 'debuff',
  Scan: 'other',
}

const STATUS_DOT: Record<StatusEffectType, { color: string; letter: string }> = {
  Weak:       { color: '#c39bd3', letter: 'W' },
  Vulnerable: { color: '#f5b7b1', letter: 'V' },
  Strength:   { color: '#f1c40f', letter: 'S' },
  Dexterity:  { color: '#74b9ff', letter: 'D' },
  Inspired:   { color: '#f1c40f', letter: 'I' },
}

function getEffectiveDamage(intent: Intent, enemy: EnemyInstance, isBoss: boolean, combatsCleared: number): number {
  let dmg = intent.value
  const scalingMultiplier = isBoss ? 1.15 : 1 + combatsCleared * 0.05
  dmg = Math.floor(dmg * scalingMultiplier)
  dmg += getStatus(enemy.statusEffects, 'Strength')
  if (getStatus(enemy.statusEffects, 'Weak') > 0) dmg = Math.floor(dmg * 0.75)
  return Math.max(0, dmg)
}

function intentValue(intent: Intent, effectiveDmg?: number): string {
  if (intent.type === 'Scan') return 'SCN'
  if (intent.type === 'DisableSlot') return (intent.targetSlot ?? '?').slice(0, 2)
  if (intent.type === 'StrainTick') return `+${intent.value}s`
  if (intent.type === 'Charge') return String(intent.value)
  const isAttack = intent.type === 'Attack' || intent.type === 'AttackDebuff' ||
    intent.type === 'BerserkerAttack' || intent.type === 'Retaliate' ||
    intent.type === 'StrainScale' || intent.type === 'Enrage' ||
    intent.type === 'PhaseShift' || intent.type === 'Leech' || intent.type === 'MartyrHeal'
  const value = isAttack && effectiveDmg != null ? effectiveDmg : intent.value
  return `${value}${intent.hits && intent.hits > 1 ? `×${intent.hits}` : ''}`
}

function intentGlyph(kind: string): string {
  switch (kind) {
    case 'attack': return '↯'
    case 'block': return '⛨'
    case 'buff': return '↑'
    case 'debuff': return '↓'
    default: return '◇'
  }
}

export default function StageEnemy({
  instance, definition, selected, combatsCleared = 0, depth, shift, onClick, onLongPress,
}: Props) {
  const sprite = getEnemySprite(definition.id)
  const healthPct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)
  const intent = definition.intentPattern[instance.intentIndex % definition.intentPattern.length]
  const isAttack = intent && (intent.type === 'Attack' || intent.type === 'AttackDebuff')
  const effectiveDmg = intent && isAttack
    ? getEffectiveDamage(intent, instance, !!definition.isBoss, combatsCleared)
    : undefined

  const kind = intent ? (INTENT_KIND[intent.type] ?? 'other') : 'other'
  const colors = KIND_COLORS[kind]

  const baseScale = 1 - depth * 0.27
  const [hovered, setHovered] = useState(false)
  const depthScale = baseScale * (hovered && !instance.isDefeated ? 1.07 : 1)
  const baseBrightness = 1 - depth * 0.15
  const brightness = baseBrightness * (hovered && !instance.isDefeated ? 1.18 : 1)
  const tierBorderColor = definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : null

  // Long-press
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
    if (dx * dx + dy * dy > 64) {
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
    if (!pressTimer.current && moved.current) return
    onClick?.()
  }

  return (
    <div
      onClick={onClickHandler}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={cancelPress}
      onPointerCancel={(e) => { cancelPress(); setHovered(false); void e }}
      onPointerLeave={() => { cancelPress(); setHovered(false) }}
      onPointerEnter={() => { if (!instance.isDefeated) setHovered(true) }}
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
        transform: `translateX(${shift}px) scale(${depthScale})`,
        transformOrigin: 'bottom center',
        filter: instance.isDefeated
          ? 'grayscale(1)'
          : `brightness(${brightness})`,
        opacity: instance.isDefeated ? 0.25 : 1,
        transition: 'transform 0.18s ease-out, filter 0.18s ease-out, opacity 0.3s',
        gap: 4,
      }}
    >
      {/* Intent chip floating above sprite */}
      {!instance.isDefeated && intent && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 6px',
          background: colors.bg,
          border: `1px solid ${colors.ring}`,
          borderRadius: 4,
          fontSize: 9,
          color: '#e9e4f5',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          minHeight: 16,
          backdropFilter: 'blur(2px)',
        }}>
          <span style={{ color: colors.glyph, fontSize: 11, lineHeight: 1 }}>
            {intentGlyph(kind)}
          </span>
          <span>{intentValue(intent, effectiveDmg)}</span>
          {instance.statusEffects.map(s => {
            const dot = STATUS_DOT[s.type]
            return (
              <span
                key={s.type}
                title={`${s.type} ${s.stacks}`}
                style={{
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${dot.color}`,
                  color: dot.color,
                  fontSize: 8,
                  fontWeight: 'bold',
                  display: 'grid',
                  placeItems: 'center',
                  lineHeight: 1,
                }}
              >
                {dot.letter}
              </span>
            )
          })}
          {instance.block > 0 && (
            <span style={{ color: '#74b9ff' }}>◆{instance.block}</span>
          )}
        </div>
      )}

      {/* Target caret */}
      {selected && !instance.isDefeated && (
        <div style={{
          position: 'absolute',
          top: 22,
          fontSize: 12,
          color: '#ffd84a',
          fontWeight: 'bold',
          textShadow: '0 0 6px rgba(255,216,74,0.8)',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          ▾
        </div>
      )}

      {/* Sprite (with optional tier ring + selection glow + hover ring) */}
      <div style={{
        position: 'relative',
        filter: selected && !instance.isDefeated
          ? 'drop-shadow(0 0 8px #ffd84a)'
          : hovered && !instance.isDefeated
            ? 'drop-shadow(0 0 6px rgba(178,164,245,0.7))'
            : tierBorderColor
              ? `drop-shadow(0 0 4px ${tierBorderColor})`
              : 'none',
        transition: 'filter 0.18s ease-out',
      }}>
        <Sprite art={sprite.art} palette={sprite.palette} pixelSize={4} />
      </div>

      {/* Thin HP slice below sprite */}
      {!instance.isDefeated && healthPct < 100 && (
        <div style={{
          width: 36,
          height: 3,
          background: '#1a0e10',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${healthPct}%`,
            background: 'linear-gradient(90deg, #e74c3c, #ff6b6b)',
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      {/* Floor shadow */}
      <div style={{
        width: `${36 * depthScale}px`,
        height: 3,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
        marginTop: -2,
      }} />
    </div>
  )
}
