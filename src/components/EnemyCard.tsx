import type { EnemyInstance, EnemyDefinition, Intent } from '../game/types'
import Sprite from './Sprite'
import { getEnemySprite } from '../data/sprites'

interface Props {
  instance: EnemyInstance
  definition: EnemyDefinition
  selected?: boolean
  recentDamage?: number
  onClick?: () => void
  compact?: boolean
}

const INTENT_ICONS: Record<string, string> = {
  Attack: 'sword',
  Block: 'shield',
  Buff: 'up',
  Debuff: 'down',
  AttackDebuff: 'sword+',
  HeatAttack: 'fire',
  DisableSlot: 'lock',
  Absorb: 'drain',
}

const INTENT_COLORS: Record<string, string> = {
  Attack: '#e74c3c',
  Block: '#3498db',
  Buff: '#2ecc71',
  Debuff: '#e67e22',
  AttackDebuff: '#c0392b',
  HeatAttack: '#fd79a8',
  DisableSlot: '#636e72',
  Absorb: '#00cec9',
}

function IntentDisplay({ intent }: { intent: Intent }) {
  const color = INTENT_COLORS[intent.type] ?? '#aaa'
  const icon = INTENT_ICONS[intent.type] ?? '?'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color,
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>
        [{icon}]
      </span>
      <span style={{ fontWeight: 'bold' }}>{intent.value}</span>
      {intent.status && (
        <span style={{ fontSize: '10px', color: '#aaa' }}>
          +{intent.status} {intent.statusStacks ?? 1}
        </span>
      )}
    </div>
  )
}

export default function EnemyCard({ instance, definition, selected, recentDamage, onClick, compact }: Props) {
  const healthPct = Math.max(0, (instance.currentHealth / instance.maxHealth) * 100)
  const currentIntent = definition.intentPattern[
    instance.intentIndex % definition.intentPattern.length
  ]

  if (compact) {
    const intentColor = currentIntent ? (INTENT_COLORS[currentIntent.type] ?? '#aaa') : '#aaa'
    const intentIcon = currentIntent ? (INTENT_ICONS[currentIntent.type] ?? '?') : '?'

    return (
      <div
        onClick={!instance.isDefeated ? onClick : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: instance.isDefeated ? '#1a1a1a' : '#1e1e2e',
          border: `2px solid ${selected ? '#f1c40f' : instance.isDefeated ? '#333' : '#4a4a6a'}`,
          borderRadius: '6px',
          padding: '4px 10px',
          minHeight: '36px',
          cursor: instance.isDefeated ? 'default' : 'pointer',
          opacity: instance.isDefeated ? 0.4 : 1,
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: selected ? '0 0 8px rgba(241,196,15,0.3)' : 'none',
          fontSize: '12px',
          color: '#e8e8e8',
          flexWrap: 'wrap',
        }}
      >
        {/* TGT label */}
        {selected && !instance.isDefeated && (
          <span style={{ fontWeight: 'bold', color: '#f1c40f', fontSize: '10px', letterSpacing: '1px' }}>TGT</span>
        )}
        {/* Name */}
        <span style={{
          fontWeight: 'bold',
          color: definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : '#e8e8e8',
          whiteSpace: 'nowrap',
        }}>
          {definition.name}
        </span>
        {/* Health bar + value */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          {recentDamage != null && recentDamage > 0 && (
            <span key={recentDamage + instance.currentHealth} className="damage-popup" style={{ fontSize: '10px' }}>
              -{recentDamage}
            </span>
          )}
          <div style={{
            width: '80px',
            height: '8px',
            backgroundColor: '#2c3e50',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${healthPct}%`,
              backgroundColor: '#e74c3c',
              borderRadius: '4px',
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{instance.currentHealth}/{instance.maxHealth}</span>
        </div>
        {/* Block */}
        {instance.block > 0 && (
          <span style={{ color: '#74b9ff', fontWeight: 'bold', fontSize: '11px' }}>+{instance.block}blk</span>
        )}
        {/* Intent */}
        {!instance.isDefeated && currentIntent && (
          <span style={{ color: intentColor, fontWeight: 'bold', fontSize: '11px' }}>
            [{intentIcon} {currentIntent.value}]
          </span>
        )}
        {/* Status pills abbreviated */}
        {instance.statusEffects.map((s) => (
          <span key={s.type} style={{
            fontSize: '10px',
            backgroundColor: '#2c3e50',
            borderRadius: '3px',
            padding: '1px 4px',
            color: '#dfe6e9',
          }}>
            {s.type[0]}{s.stacks}
          </span>
        ))}
        {instance.isDefeated && (
          <span style={{ fontSize: '11px', color: '#555' }}>Defeated</span>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={!instance.isDefeated ? onClick : undefined}
      style={{
        backgroundColor: instance.isDefeated ? '#1a1a1a' : '#1e1e2e',
        border: `2px solid ${selected ? '#f1c40f' : instance.isDefeated ? '#333' : '#4a4a6a'}`,
        borderRadius: '10px',
        padding: '14px',
        minWidth: '150px',
        cursor: instance.isDefeated ? 'default' : 'pointer',
        opacity: instance.isDefeated ? 0.4 : 1,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 12px rgba(241,196,15,0.4)' : 'none',
      }}
    >
      {/* Target badge */}
      {selected && !instance.isDefeated && (
        <div style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#f1c40f',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          TARGET
        </div>
      )}

      {/* Sprite + Name */}
      {(() => {
        const sprite = getEnemySprite(definition.id)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sprite art={sprite.art} palette={sprite.palette} pixelSize={3} />
            <div style={{
              fontWeight: 'bold',
              fontSize: '14px',
              color: definition.isBoss ? '#e74c3c' : definition.isElite ? '#e67e22' : '#e8e8e8',
            }}>
              {definition.name}
              {definition.isElite && <span style={{ fontSize: '10px', marginLeft: '4px', color: '#e67e22' }}>ELITE</span>}
              {definition.isBoss && <span style={{ fontSize: '10px', marginLeft: '4px', color: '#e74c3c' }}>BOSS</span>}
            </div>
          </div>
        )
      })()}

      {/* Health bar */}
      <div style={{ marginBottom: '8px', position: 'relative' }}>
        {recentDamage != null && recentDamage > 0 && (
          <div key={recentDamage + instance.currentHealth} className="damage-popup">
            -{recentDamage}
          </div>
        )}
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px', display: 'flex', gap: '8px' }}>
          <span>{instance.currentHealth} / {instance.maxHealth}</span>
          {instance.block > 0 && (
            <span style={{ color: '#74b9ff', fontWeight: 'bold' }}>Shield {instance.block}</span>
          )}
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#2c3e50',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${healthPct}%`,
            backgroundColor: '#e74c3c',
            borderRadius: '4px',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Intent */}
      {!instance.isDefeated && currentIntent && (
        <div>
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '3px' }}>Next:</div>
          <IntentDisplay intent={currentIntent} />
        </div>
      )}

      {/* Status effects */}
      {instance.statusEffects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '6px' }}>
          {instance.statusEffects.map((s) => (
            <span key={s.type} style={{
              fontSize: '9px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px',
              padding: '1px 5px',
              color: '#dfe6e9',
            }}>
              {s.type} {s.stacks}
            </span>
          ))}
        </div>
      )}

      {instance.isDefeated && (
        <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>Defeated</div>
      )}
    </div>
  )
}
