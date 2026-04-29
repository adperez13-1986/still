import type { CombatState } from '../game/types'
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'
import DamageNumber from './DamageNumber'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  health: number
  maxHealth: number
  block: number
  damageNumbers: DamageNumberItem[]
}

function StatChip({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      background: 'rgba(0, 0, 0, 0.4)',
      border: `1px solid ${color}55`,
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 'bold',
      color: '#e9e4f5',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(2px)',
    }}>
      <span style={{ color, fontSize: 12 }}>{icon}</span>
      <span style={{ color }}>{value}</span>
    </div>
  )
}

export default function StillStage({
  combat, health, maxHealth, block, damageNumbers,
}: Props) {
  return (
    <div style={{
      width: 200,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      padding: '24px 8px 24px 24px',
      position: 'relative',
    }}>
      {/* Floating stat chips above sprite */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <StatChip icon="❤" value={`${health}/${maxHealth}`} color="#e74c3c" />
        {block > 0 && <StatChip icon="◆" value={String(block)} color="#74b9ff" />}
        <StatChip icon="⚡" value={`${combat.currentEnergy}/${combat.maxEnergy}`} color="#f1c40f" />
      </div>

      {/* Status pills (Strength / Dex / etc.) — only render if any */}
      {combat.statusEffects.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {combat.statusEffects.map(s => (
            <span key={s.type} style={{
              fontSize: 9,
              padding: '1px 5px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid #3d3868',
              borderRadius: 3,
              color: '#a09bbe',
              letterSpacing: 1,
              fontWeight: 'bold',
            }}>
              {s.type[0]}{s.stacks}
            </span>
          ))}
        </div>
      )}

      {/* Sprite */}
      <div style={{ position: 'relative', marginTop: 4 }}>
        <Sprite art={STILL_SPRITE.art} palette={STILL_SPRITE.palette} pixelSize={5} />
      </div>

      {/* Floor shadow */}
      <div style={{
        width: 60,
        height: 4,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
        marginTop: -4,
      }} />

      {/* STILL label badge */}
      <div style={{
        padding: '3px 14px',
        border: '1px solid #3d3868',
        background: 'rgba(178,164,245,0.08)',
        borderRadius: 4,
        fontSize: 11,
        letterSpacing: 3,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#b2a4f5',
      }}>
        STILL
      </div>

      {damageNumbers
        .filter(dn => dn.target === 'still')
        .map(dn => (
          <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="50%" />
        ))}
    </div>
  )
}
