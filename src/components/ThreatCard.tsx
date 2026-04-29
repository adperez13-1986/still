import type { EnemyInstance, EnemyDefinition, Intent, StatusEffectType } from '../game/types'
import { getStatus } from '../game/combat'
import Sprite from './Sprite'
import { getEnemySprite } from '../data/sprites'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  selected?: boolean
  combatsCleared?: number
  onClick?: () => void
}

const INTENT_KIND: Record<string, 'attack' | 'block' | 'buff' | 'debuff' | 'other'> = {
  Attack: 'attack', AttackDebuff: 'attack', Retaliate: 'attack', StrainScale: 'attack',
  Charge: 'attack', Leech: 'attack', Enrage: 'attack', BerserkerAttack: 'attack',
  PhaseShift: 'attack', MartyrHeal: 'attack',
  Block: 'block', ShieldAllies: 'block', StealBlock: 'block',
  Buff: 'buff', ConditionalBuff: 'buff', Inspired: 'buff',
  Debuff: 'debuff', StrainTick: 'debuff', DisableSlot: 'debuff', CopyAction: 'debuff',
  Scan: 'other',
}

const KIND_COLORS = {
  attack: { bg: 'rgba(231,76,60,0.10)', border: 'rgba(231,76,60,0.4)', glyph: '#e74c3c', text: '#e9e4f5' },
  block:  { bg: 'rgba(116,185,255,0.10)', border: 'rgba(116,185,255,0.4)', glyph: '#74b9ff', text: '#e9e4f5' },
  buff:   { bg: 'rgba(241,196,15,0.10)', border: 'rgba(241,196,15,0.4)', glyph: '#f1c40f', text: '#e9e4f5' },
  debuff: { bg: 'rgba(195,155,211,0.10)', border: 'rgba(195,155,211,0.4)', glyph: '#c39bd3', text: '#e9e4f5' },
  other:  { bg: 'rgba(178,164,245,0.10)', border: 'rgba(178,164,245,0.4)', glyph: '#b2a4f5', text: '#e9e4f5' },
}

const STATUS_CHIPS: Record<StatusEffectType, { bg: string; fg: string; border: string; text: string }> = {
  Weak:       { bg: 'rgba(195,155,211,0.15)', fg: '#c39bd3', border: 'rgba(195,155,211,0.3)', text: 'WEAK' },
  Vulnerable: { bg: 'rgba(245,183,177,0.15)', fg: '#f5b7b1', border: 'rgba(245,183,177,0.3)', text: 'VULN' },
  Strength:   { bg: 'rgba(241,196,15,0.12)',  fg: '#f1c40f', border: 'rgba(241,196,15,0.3)',  text: 'STR' },
  Dexterity:  { bg: 'rgba(116,185,255,0.15)', fg: '#74b9ff', border: 'rgba(116,185,255,0.3)', text: 'DEX' },
  Inspired:   { bg: 'rgba(241,196,15,0.12)',  fg: '#f1c40f', border: 'rgba(241,196,15,0.3)',  text: 'INS' },
}

function getEffectiveDamage(intent: Intent, enemy: EnemyInstance, isBoss: boolean, combatsCleared: number): number {
  let dmg = intent.value
  const scalingMultiplier = isBoss ? 1.15 : 1 + combatsCleared * 0.05
  dmg = Math.floor(dmg * scalingMultiplier)
  dmg += getStatus(enemy.statusEffects, 'Strength')
  if (getStatus(enemy.statusEffects, 'Weak') > 0) dmg = Math.floor(dmg * 0.75)
  return Math.max(0, dmg)
}

function intentText(intent: Intent, effectiveDmg?: number): string {
  if (intent.type === 'Scan') return 'Scanning'
  if (intent.type === 'DisableSlot') return `Lock ${intent.targetSlot ?? '?'}`
  if (intent.type === 'StrainTick') return `+${intent.value} strain`
  if (intent.type === 'CopyAction') return 'Mirror'
  if (intent.type === 'Charge') return `Charge ${intent.value}`
  if (intent.type === 'ShieldAllies') return 'Shield allies'
  if (intent.type === 'StealBlock') return 'Steal'
  const isAttack = intent.type === 'Attack' || intent.type === 'AttackDebuff' ||
    intent.type === 'BerserkerAttack' || intent.type === 'Retaliate' ||
    intent.type === 'StrainScale' || intent.type === 'Enrage' ||
    intent.type === 'PhaseShift' || intent.type === 'Leech' || intent.type === 'MartyrHeal'
  const value = isAttack && effectiveDmg != null ? effectiveDmg : intent.value
  const verb = isAttack ? 'Atk'
    : intent.type === 'Block' ? 'Block'
    : intent.type === 'Buff' || intent.type === 'ConditionalBuff' ? 'Buff'
    : intent.type === 'Debuff' ? 'Debuff'
    : intent.type
  return `${verb} ${value}${intent.hits && intent.hits > 1 ? `×${intent.hits}` : ''}`
}

export default function ThreatCard({ instance, definition, selected, combatsCleared = 0, onClick }: Props) {
  const sprite = getEnemySprite(definition.id)
  const healthPct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)
  const intent = definition.intentPattern[instance.intentIndex % definition.intentPattern.length]
  const isAttack = intent && (intent.type === 'Attack' || intent.type === 'AttackDebuff')
  const effectiveDmg = intent && isAttack
    ? getEffectiveDamage(intent, instance, !!definition.isBoss, combatsCleared)
    : undefined

  const intentKind = intent ? (INTENT_KIND[intent.type] ?? 'other') : 'other'
  const kindColors = KIND_COLORS[intentKind]
  const intentSubtext = intent?.status ? ` · ${intent.status} +${intent.statusStacks ?? 1}` : ''

  const nameColor = definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : '#e9e4f5'

  return (
    <div
      onClick={!instance.isDefeated ? onClick : undefined}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #1f1a3a 0%, #15122a 100%)',
        border: `1px solid ${selected ? '#ffd84a' : '#2a2546'}`,
        borderRadius: 10,
        padding: '10px 10px 8px',
        cursor: instance.isDefeated ? 'default' : 'pointer',
        opacity: instance.isDefeated ? 0.4 : 1,
        boxShadow: selected ? '0 0 0 1px #ffd84a, 0 0 24px rgba(255,216,74,0.18)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.2s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Target pip */}
      {selected && !instance.isDefeated && (
        <div style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: '#ffd84a',
          color: '#1a1300',
          fontSize: 11,
          width: 16,
          height: 16,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          fontWeight: 'bold',
          zIndex: 2,
          boxShadow: '0 0 8px rgba(255,216,74,0.6)',
          lineHeight: 1,
        }}>
          ◉
        </div>
      )}

      {/* Top row: portrait + info */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          width: 48,
          height: 48,
          background: '#07050e',
          border: '1px solid #3d3868',
          borderRadius: 6,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          <Sprite art={sprite.art} palette={sprite.palette} pixelSize={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: 13,
            color: nameColor,
            lineHeight: 1,
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: selected ? 22 : 0,
          }}>
            {definition.name}
          </div>
          <div style={{
            height: 5,
            background: '#1a0e10',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 3,
          }}>
            <div style={{
              height: '100%',
              width: `${healthPct}%`,
              background: 'linear-gradient(90deg, #e74c3c, #ff6b6b)',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 9, color: '#a09bbe', display: 'flex', gap: 6, letterSpacing: 0.5 }}>
            <span>
              <b style={{ color: '#e9e4f5' }}>{instance.currentHealth}</b>
              <span style={{ color: '#6b6585' }}>/{instance.maxHealth}</span>
            </span>
            {instance.block > 0 && (
              <span style={{ color: '#74b9ff' }}>◆ {instance.block}</span>
            )}
          </div>
        </div>
      </div>

      {/* Intent stamp */}
      {!instance.isDefeated && intent && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 8px',
          background: kindColors.bg,
          border: `1px dashed ${kindColors.border}`,
          borderRadius: 4,
        }}>
          <span style={{
            fontSize: 18,
            lineHeight: 1,
            color: kindColors.glyph,
          }}>
            {intentKind === 'attack' ? '↯' : intentKind === 'block' ? '⛨' : intentKind === 'buff' ? '↑' : intentKind === 'debuff' ? '↓' : '◇'}
          </span>
          <span style={{
            fontSize: 10,
            color: kindColors.text,
            letterSpacing: 0.3,
            lineHeight: 1.1,
          }}>
            <b style={{ color: kindColors.text, fontWeight: 'bold' }}>
              {intentText(intent, effectiveDmg)}
            </b>
            {intentSubtext && <span style={{ color: '#a09bbe' }}>{intentSubtext}</span>}
          </span>
        </div>
      )}

      {/* Status chips */}
      {instance.statusEffects.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginTop: 6,
        }}>
          {instance.statusEffects.map(s => {
            const c = STATUS_CHIPS[s.type]
            return (
              <span key={s.type} style={{
                fontSize: 8,
                letterSpacing: 1,
                padding: '1px 5px',
                borderRadius: 2,
                fontWeight: 'bold',
                background: c.bg,
                color: c.fg,
                border: `1px solid ${c.border}`,
              }}>
                {c.text} {s.stacks}
              </span>
            )
          })}
        </div>
      )}

      {instance.isDefeated && (
        <div style={{ fontSize: 9, color: '#3d3858', marginTop: 6, fontStyle: 'italic' }}>
          Defeated
        </div>
      )}
    </div>
  )
}
