import { useEffect, useRef } from 'react'
import type { EnemyInstance, EnemyDefinition, Intent, StatusEffectType } from '../game/types'
import { getStatus } from '../game/combat'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  combatsCleared: number
  anchor: { x: number; y: number }
  onClose: () => void
}

const INTENT_LABEL: Record<string, string> = {
  Attack: 'Attack', Block: 'Block', Buff: 'Buff', Debuff: 'Debuff',
  AttackDebuff: 'Attack + Debuff', DisableSlot: 'Disable Slot', Scan: 'Scan',
  Retaliate: 'Retaliate', StrainScale: 'Strain-Scaling Attack',
  CopyAction: 'Mirror', Charge: 'Charging', ConditionalBuff: 'Conditional Buff',
  Leech: 'Leech', StrainTick: 'Strain Pulse', Enrage: 'Enrage',
  ShieldAllies: 'Shield Allies', BerserkerAttack: 'Berserker',
  PhaseShift: 'Phase Shift', StealBlock: 'Steal Block', MartyrHeal: 'Martyr Heal',
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

function intentDetail(intent: Intent, effectiveDmg?: number): string {
  if (intent.type === 'Scan') return 'Scanning the field'
  if (intent.type === 'DisableSlot') return `Disable ${intent.targetSlot ?? '?'}`
  if (intent.type === 'StrainTick') return `+${intent.value} strain`
  if (intent.type === 'CopyAction') return 'Mirrors player actions'
  if (intent.type === 'Charge') return `Charging — ${intent.value} blast incoming`
  if (intent.type === 'ShieldAllies') return 'Granting block to other enemies'
  if (intent.type === 'StealBlock') return 'Will steal block on hit'
  const isAttack = intent.type === 'Attack' || intent.type === 'AttackDebuff' ||
    intent.type === 'BerserkerAttack' || intent.type === 'Retaliate' ||
    intent.type === 'StrainScale' || intent.type === 'Enrage' ||
    intent.type === 'PhaseShift' || intent.type === 'Leech' || intent.type === 'MartyrHeal'
  const value = isAttack && effectiveDmg != null ? effectiveDmg : intent.value
  const hits = intent.hits && intent.hits > 1 ? ` × ${intent.hits} hits` : ''
  if (isAttack) return `${value} damage${hits}`
  if (intent.type === 'Block') return `${value} block${hits}`
  if (intent.type === 'Buff' || intent.type === 'ConditionalBuff') return `+${intent.statusStacks ?? value} ${intent.status ?? ''}`
  if (intent.type === 'Debuff') return `${intent.status ?? 'Debuff'} +${intent.statusStacks ?? value}`
  return `${value}${hits}`
}

export default function EnemyInspector({
  instance, definition, combatsCleared, anchor, onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Defer one frame so the opening tap doesn't immediately close
    const t = setTimeout(() => window.addEventListener('pointerdown', onDown), 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [onClose])

  const intent = definition.intentPattern[instance.intentIndex % definition.intentPattern.length]
  const isAttack = intent && (intent.type === 'Attack' || intent.type === 'AttackDebuff')
  const effectiveDmg = intent && isAttack
    ? getEffectiveDamage(intent, instance, !!definition.isBoss, combatsCleared)
    : undefined

  const healthPct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)

  // Anchor with viewport clamp
  const PANEL_W = 240
  const PANEL_H = 220
  const margin = 8
  let left = anchor.x + 12
  let top = anchor.y - 12
  if (left + PANEL_W + margin > window.innerWidth) left = anchor.x - PANEL_W - 12
  if (top + PANEL_H + margin > window.innerHeight) top = window.innerHeight - PANEL_H - margin
  if (left < margin) left = margin
  if (top < margin) top = margin

  const nameColor = definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : '#e9e4f5'

  return (
    <>
      <style>{`
        @keyframes inspector-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          left,
          top,
          width: PANEL_W,
          background: 'linear-gradient(180deg, #1f1a3a 0%, #15122a 100%)',
          border: '1px solid #4a4470',
          borderRadius: 8,
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          fontSize: 12,
          color: '#e9e4f5',
          animation: 'inspector-in 120ms ease-out',
        }}
      >
        {/* Name + tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontWeight: 'bold', fontSize: 14, color: nameColor }}>
            {definition.name}
          </span>
          {definition.isBoss && (
            <span style={{ fontSize: 9, fontWeight: 'bold', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 3, padding: '1px 4px', letterSpacing: 1 }}>BOSS</span>
          )}
          {definition.isElite && !definition.isBoss && (
            <span style={{ fontSize: 9, fontWeight: 'bold', color: '#e67e22', border: '1px solid #e67e22', borderRadius: 3, padding: '1px 4px', letterSpacing: 1 }}>ELITE</span>
          )}
        </div>

        {/* HP */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#a09bbe', marginBottom: 3 }}>
            <span style={{ letterSpacing: 1 }}>HP</span>
            <span><b style={{ color: '#e9e4f5' }}>{instance.currentHealth}</b> / {instance.maxHealth}</span>
          </div>
          <div style={{ height: 6, background: '#1a0e10', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${healthPct}%`,
              background: 'linear-gradient(90deg, #e74c3c, #ff6b6b)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Block */}
        {instance.block > 0 && (
          <div style={{ fontSize: 11, color: '#74b9ff', marginBottom: 8 }}>
            ◆ Shield <b>{instance.block}</b>
          </div>
        )}

        {/* Intent */}
        {!instance.isDefeated && intent && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#3d3858', marginBottom: 3, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>
              Next
            </div>
            <div style={{ fontSize: 11, color: '#e9e4f5', lineHeight: 1.4 }}>
              <b style={{ color: '#b2a4f5' }}>{INTENT_LABEL[intent.type] ?? intent.type}</b>
              <span style={{ color: '#a09bbe' }}> · {intentDetail(intent, effectiveDmg)}</span>
            </div>
          </div>
        )}

        {/* Statuses */}
        {instance.statusEffects.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: '#3d3858', marginBottom: 3, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>
              Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {instance.statusEffects.map(s => (
                <span key={s.type} style={{
                  fontSize: 10,
                  background: 'rgba(178,164,245,0.12)',
                  border: '1px solid #3d3868',
                  color: '#e9e4f5',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}>
                  {STATUS_LABELS[s.type]} <b style={{ color: '#b2a4f5' }}>{s.stacks}</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
