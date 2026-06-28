import type { Station } from '@/types/network'
import { getLine } from '@/lib/network'
import { pointFor } from '@/lib/coords'
import { useSelection } from '@/hooks/useSelection'
import { useViewMode } from '@/hooks/useViewMode'

interface Props {
  station: Station
}

export function StationNode({ station }: Props) {
  const selectStation = useSelection((s) => s.selectStation)
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const p = pointFor(station, mode)

  const isSelected =
    selection?.kind === 'station' && selection.id === station.id

  const firstLine = getLine(station.lineIds[0])
  const fill = station.interchange ? '#ffffff' : firstLine?.color ?? '#444'
  const stroke = station.interchange ? '#1a1a1a' : '#ffffff'
  const r = station.interchange ? 9 : 5.5

  return (
    <g
      role="button"
      aria-label={`Estação ${station.name}`}
      tabIndex={0}
      className="cursor-pointer focus:outline-none"
      onClick={(e) => {
        e.stopPropagation()
        selectStation(station.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          selectStation(station.id)
        }
      }}
    >
      {isSelected && (
        <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke="#1a1a1a" strokeWidth={2} />
      )}
      <circle
        cx={p.x}
        cy={p.y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={station.interchange ? 3 : 2}
      />
    </g>
  )
}
