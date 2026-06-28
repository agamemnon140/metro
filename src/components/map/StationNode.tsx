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

  // foco em linha: esmaece estações que não pertencem a ela
  const focusLine = selection?.kind === 'line' ? selection.id : null
  const dimmed = focusLine !== null && !station.lineIds.includes(focusLine)

  const firstLine = getLine(station.lineIds[0])
  const color = firstLine?.color ?? '#444'
  const future = Boolean(station.phase && station.phase !== 'operando')
  // não-operando/baldeação = oca (fundo branco); comum = preenchida na cor
  const hollow = station.interchange || future
  const fill = hollow ? '#ffffff' : color
  const stroke = station.interchange ? '#1a1a1a' : future ? color : '#ffffff'
  // geográfico é mais denso -> ícones menores
  const mul = mode === 'geographic' ? 0.65 : 1
  const r = (station.interchange ? 5.5 : 3.5) * mul

  return (
    <g
      role="button"
      aria-label={`Estação ${station.name}`}
      tabIndex={0}
      className="cursor-pointer focus:outline-none"
      opacity={dimmed ? 0.12 : 1}
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
        <circle cx={p.x} cy={p.y} r={r + 4 * mul} fill="none" stroke="#1a1a1a" strokeWidth={1.5 * mul} />
      )}
      <circle
        cx={p.x}
        cy={p.y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={(station.interchange ? 2 : 1.5) * mul}
      />
    </g>
  )
}
