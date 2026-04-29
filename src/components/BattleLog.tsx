import type { CombatEvent, CombatState } from '../game/types'
import { ALL_ENEMIES } from '../data/enemies'

interface Props {
  combat: CombatState
  lines?: number
  variant?: 'portrait' | 'landscape'
}

interface FormattedSpan { text: string; color?: string; bold?: boolean }

function enemyName(enemyId: string, combat: CombatState): string {
  const e = combat.enemies.find(en => en.instanceId === enemyId)
  if (!e) return 'enemy'
  return ALL_ENEMIES[e.definitionId]?.name ?? 'enemy'
}

function formatLogLine(event: CombatEvent, combat: CombatState): FormattedSpan[] {
  if (event.type === 'slotFire') {
    const totalDmg = event.damages?.reduce((s, d) => s + d.amount, 0) ?? 0
    if (totalDmg > 0) {
      const name = event.damages?.length === 1
        ? enemyName(event.damages[0].enemyId, combat)
        : 'enemies'
      return [
        { text: 'Still', color: '#a29bfe', bold: true },
        { text: ' hit ' },
        { text: name, color: '#dfe6e9' },
        { text: ' for ' },
        { text: String(totalDmg), color: '#e74c3c', bold: true },
      ]
    }
    if (event.block) {
      return [
        { text: 'Still', color: '#a29bfe', bold: true },
        { text: ' gained ' },
        { text: String(event.block), color: '#74b9ff', bold: true },
        { text: ' block' },
      ]
    }
    if (event.heal) {
      return [
        { text: 'Still', color: '#a29bfe', bold: true },
        { text: ' healed ' },
        { text: String(event.heal), color: '#2ecc71', bold: true },
      ]
    }
    return [{ text: `${event.slot} fired` }]
  }
  if (event.type === 'enemyAction') {
    if (event.damage && event.damage > 0) {
      return [
        { text: event.enemyName, color: '#dfe6e9', bold: true },
        { text: ' struck ' },
        { text: 'Still', color: '#a29bfe', bold: true },
        { text: ' for ' },
        { text: String(event.damage), color: '#e74c3c', bold: true },
      ]
    }
    if (event.blocked && event.blocked > 0) {
      return [
        { text: 'Still', color: '#a29bfe', bold: true },
        { text: ' blocked ' },
        { text: String(event.blocked), color: '#74b9ff', bold: true },
      ]
    }
    if (event.block) {
      return [
        { text: event.enemyName, color: '#dfe6e9', bold: true },
        { text: ' guarded ' },
        { text: String(event.block), color: '#74b9ff', bold: true },
      ]
    }
    if (event.counterDamage) {
      return [
        { text: 'Counter dealt ' },
        { text: String(event.counterDamage), color: '#e74c3c', bold: true },
        { text: ' back' },
      ]
    }
    return [{ text: `${event.enemyName} acted` }]
  }
  if (event.type === 'partTrigger') {
    return [{ text: `${event.partId} triggered`, color: '#888' }]
  }
  return [{ text: '—' }]
}

export default function BattleLog({ combat, lines = 3, variant = 'portrait' }: Props) {
  const allLines = combat.combatLog.slice(-lines).map((e, i) => ({
    spans: formatLogLine(e, combat),
    isRecent: i === combat.combatLog.slice(-lines).length - 1,
    round: combat.roundNumber,
  }))

  const isLandscape = variant === 'landscape'

  return (
    <div style={{
      borderTop: '1px solid #2a2546',
      borderBottom: '1px solid #2a2546',
      padding: isLandscape ? '4px 8px' : '6px 10px',
      fontSize: 9.5,
      lineHeight: 1.5,
      color: '#a09bbe',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      background: 'rgba(0, 0, 0, 0.4)',
      minHeight: lines * 16 + 12,
      overflow: 'hidden',
    }}>
      {allLines.length === 0 ? (
        <div style={{ color: '#3d3858', fontStyle: 'italic' }}>
          Awaiting first action…
        </div>
      ) : allLines.map((line, i) => (
        <div key={i} style={{
          color: line.isRecent ? '#e9e4f5' : '#a09bbe',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          <span style={{ color: '#3d3858', marginRight: 6 }}>R{line.round}</span>
          {line.spans.map((s, j) => (
            <span key={j} style={{
              color: s.color ?? (line.isRecent ? '#e9e4f5' : '#a09bbe'),
              fontWeight: s.bold ? 'bold' : 'normal',
            }}>
              {s.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
