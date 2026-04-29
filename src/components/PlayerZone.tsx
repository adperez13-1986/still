import type { CombatState, BodySlot, EquipmentDefinition, RunState } from '../game/types'
import type { SlotProjection } from '../game/combat'
import HandRail from './HandRail'
import BodyRig from './BodyRig'
import StatsRail from './StatsRail'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  run: Pick<RunState, 'health' | 'maxHealth' | 'parts' | 'equipment'>
  selectedCardId: string | null
  pushed: boolean
  projections: SlotProjection[]
  activeSlot: BodySlot | null
  displayHealth: number | null
  displayBlock: number | null
  damageNumbers: DamageNumberItem[]
  onSelectCard: (instanceId: string | null) => void
  onTogglePush: () => void
  onAssignSlot: (slot: BodySlot) => void
  onLongPressEquip?: (equip: EquipmentDefinition) => void
}

export default function PlayerZone({
  combat, run, selectedCardId, pushed, projections, activeSlot,
  displayHealth, displayBlock, damageNumbers,
  onSelectCard, onTogglePush, onAssignSlot,
}: Props) {
  const health = displayHealth ?? run.health
  const block = displayBlock ?? combat.block

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px 1fr 64px',
      gap: 10,
      alignItems: 'start',
      background: 'linear-gradient(180deg, transparent 0%, rgba(15,12,28,0.6) 30%, #0c0a18 100%)',
      padding: '12px 8px 4px',
      position: 'relative',
    }}>
      <HandRail
        combat={combat}
        selectedCardId={selectedCardId}
        pushed={pushed}
        onSelect={onSelectCard}
        onTogglePush={onTogglePush}
      />
      <BodyRig
        combat={combat}
        equipment={run.equipment}
        parts={run.parts}
        selectedCardId={selectedCardId}
        projections={projections}
        activeSlot={activeSlot}
        onAssign={onAssignSlot}
      />
      <StatsRail
        combat={combat}
        health={health}
        maxHealth={run.maxHealth}
        block={block}
        damageNumbers={damageNumbers}
      />
    </div>
  )
}
