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
  // não-operando/baldeação = oca (cor do fundo); comum = preenchida na cor
  const hollow = station.interchange || future
  const fill = hollow ? 'var(--map-surface)' : color
  const stroke = station.interchange
    ? 'var(--map-station-ring)'
    : future
      ? color
      : 'var(--map-surface)'
  // geográfico é mais denso -> ícones menores
  const mul = mode === 'geographic' ? 0.65 : 1
  // hubs crescem com o nº de linhas; cápsula orientada fica como evolução
  // futura (o dataset tem um ponto único por estação, sem orientação)
  const n = station.lineIds.length
  const r =
    (station.interchange ? 5.5 + Math.min(Math.max(n - 2, 0), 3) * 1.1 : 3.5) *
    mul
  const bigHub = station.interchange && n >= 3

  return (
    <g
      role="button"
      aria-label={`Estação ${station.name}`}
      tabIndex={0}
      className="cursor-pointer focus:outline-none"
      style={{ opacity: dimmed ? 'var(--map-dim-opacity)' : 1 }}
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
        <>
          <circle cx={p.x} cy={p.y} r={r + 5 * mul} fill={color} opacity={0.25} />
          <circle
            cx={p.x}
            cy={p.y}
            r={r + 3 * mul}
            fill="none"
            stroke={color}
            strokeWidth={1.5 * mul}
          />
        </>
      )}
      <circle
        cx={p.x}
        cy={p.y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={(station.interchange ? 2 : 1.5) * mul}
      />
      {bigHub && (
        <circle
          cx={p.x}
          cy={p.y}
          r={r * 0.45}
          fill="none"
          stroke="var(--map-station-ring)"
          strokeWidth={1 * mul}
        />
      )}
    </g>
  )
}
