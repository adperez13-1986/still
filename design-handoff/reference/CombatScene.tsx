// REFERENCE — new file, drop at src/components/CombatScene.tsx
//
// The diorama stage container. Replaces the existing desktop "top section"
// (the side-by-side StillPanel + enemy flex-wrap) with a fixed-height stage
// holding StillColumn on the left and EnemyStage on the right.
//
// Floating HUD (sector/round/info) sits absolutely over the stage corners.
// The big strain meter is moved INTO the stage (top-center) per SPEC.md.

import type { CombatState, EnemyInstance, RunState } from '../game/types'
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'
import EnemyStage from './EnemyStage'
import DamageNumber from './DamageNumber'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  run: Pick<RunState, 'health' | 'maxHealth' | 'sector' | 'combatsCleared'>
  // Display overrides during animation replay (from CombatScreen state)
  displayHealth: number | null
  displayBlock: number | null
  displayEnemyHealth: Record<string, number> | null
  effectiveTarget: string | null
  damageNumbers: DamageNumberItem[]
  onTarget: (enemyId: string) => void
  onOpenInfo: () => void
}

export default function CombatScene({
  combat,
  run,
  displayHealth,
  displayBlock,
  displayEnemyHealth,
  effectiveTarget,
  damageNumbers,
  onTarget,
  onOpenInfo,
}: Props) {
  const health = displayHealth ?? run.health
  const block = displayBlock ?? combat.block
  const healthPct = Math.max(0, (health / run.maxHealth) * 100)
  const healthColor = healthPct > 50 ? '#27ae60' : healthPct > 25 ? '#f39c12' : '#c0392b'

  const strainColor = combat.strain <= 7 ? '#636e72' : combat.strain <= 14 ? '#e67e22' : '#e74c3c'
  const strainPct = Math.min(100, (combat.strain / combat.maxStrain) * 100)

  return (
    <div style={{
      position: 'relative',
      height: 'clamp(420px, 60vh, 640px)',
      display: 'flex',
      background:
        'radial-gradient(ellipse at 30% 60%, rgba(162, 155, 254, 0.06) 0%, transparent 50%), ' +
        'linear-gradient(to bottom, #0d0d1a 0%, #0a0a14 70%, #050508 100%)',
      border: '1px solid #2c3e50',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Floor fog gradient */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: 80,
        background: 'linear-gradient(to top, rgba(13, 13, 26, 0.85), transparent)',
        pointerEvents: 'none',
      }} />

      {/* ─── Left: Still column ────────────────────────────────────── */}
      <div style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        position: 'relative',
        gap: 12,
      }}>
        {/* Sprite + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Sprite art={STILL_SPRITE.art} palette={STILL_SPRITE.palette} pixelSize={6} />
          <div style={{
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 3,
            color: '#a29bfe',
          }}>
            STILL
          </div>
          {/* Floor shadow */}
          <div style={{
            width: 80,
            height: 6,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
            marginTop: -8,
          }} />
        </div>

        {/* HP bar */}
        <div style={{ width: 160 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', marginBottom: 3, letterSpacing: 1 }}>
            <span>HP</span>
            <span>{health} / {run.maxHealth}</span>
          </div>
          <div style={{ height: 6, background: '#2c3e50', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${healthPct}%`,
              background: healthColor,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Energy + Block + statuses (compact horizontal row) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 11,
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: 160,
        }}>
          <span style={{ fontWeight: 'bold', color: '#e67e22' }}>
            E {combat.currentEnergy}/{combat.maxEnergy}
          </span>
          {block > 0 && (
            <span style={{ fontWeight: 'bold', color: '#74b9ff' }}>◆ {block}</span>
          )}
          {combat.statusEffects.map(s => (
            <span key={s.type} style={{
              fontSize: 9,
              background: '#2c3e50',
              borderRadius: 3,
              padding: '1px 5px',
              color: '#dfe6e9',
            }}>
              {s.type[0]}{s.stacks}
            </span>
          ))}
        </div>

        {/* Damage numbers anchored to Still */}
        {damageNumbers
          .filter(dn => dn.target === 'still')
          .map(dn => (
            <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="40%" />
          ))}
      </div>

      {/* ─── Right: Enemy stage ─────────────────────────────────────── */}
      <EnemyStage
        combat={combat}
        effectiveTarget={effectiveTarget}
        combatsCleared={run.combatsCleared}
        damageNumbers={damageNumbers}
        displayEnemyHealth={displayEnemyHealth}
        onTarget={onTarget}
      />

      {/* ─── Floating HUD ───────────────────────────────────────────── */}

      {/* Top-left: sector + round */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 16,
        fontSize: 10,
        color: '#666',
        letterSpacing: 2,
        fontWeight: 600,
        pointerEvents: 'none',
      }}>
        SECTOR {run.sector} · RD {combat.roundNumber}
      </div>

      {/* Top-center: thin strain meter */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 220,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: '#aaa',
          letterSpacing: 1,
          marginBottom: 2,
        }}>
          <span>STRAIN</span>
          <span>{combat.strain}/{combat.maxStrain}</span>
        </div>
        <div style={{ height: 4, background: '#2d3436', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${strainPct}%`,
            background: strainColor,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Top-right: Info */}
      <button
        onClick={onOpenInfo}
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid #333',
          borderRadius: 4,
          color: '#74b9ff',
          fontSize: 10,
          cursor: 'pointer',
          padding: '3px 10px',
          letterSpacing: 1,
        }}
      >
        INFO
      </button>
    </div>
  )
}
