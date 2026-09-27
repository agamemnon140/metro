import { useMemo } from 'react'
import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { pointFor } from '@/lib/coords'
import { roundedPath } from '@/lib/geometry'
import { lineSegments, TRACK_STYLES } from '@/lib/lineSegments'
import { useSelection } from '@/hooks/useSelection'
import { useViewMode } from '@/hooks/useViewMode'
import { useLayers } from '@/hooks/useLayers'

interface Props {
  line: Line
}

export function LinePath({ line }: Props) {
  const selectLine = useSelection((s) => s.selectLine)
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const layers = useLayers()

  // Trechos contínuos de estações visíveis (um path por trecho). Estações
  // ocultas (bloco desligado) quebram o traço; cada trecho ganha cantos
  // arredondados (fillet) — os pontos das estações não mudam.
  const runs = useMemo(() => {
    const sts = stationsForLine(line, mode)
    const radius = mode === 'geographic' ? 5 : 9
    return lineSegments(line, sts, layers).map((run) => ({
      d: roundedPath(run.stations.map((s) => pointFor(s, mode)), radius),
      style: run.style,
    }))
  }, [line, mode, layers])

  if (!runs.length) return null

  const isSelected = selection?.kind === 'line' && selection.id === line.id
  const dimmed = selection?.kind === 'line' && !isSelected
  const base = mode === 'geographic' ? 4 : 4.5
  const width = isSelected ? base + 3 : base

  return (
    <g
      role="button"
      aria-label={`Linha ${line.fullName}`}
      tabIndex={0}
      className="cursor-pointer focus:outline-none"
      style={{ opacity: dimmed ? 'var(--map-dim-opacity)' : 1 }}
      onClick={(e) => {
        e.stopPropagation()
        selectLine(line.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          selectLine(line.id)
        }
      }}
    >
      {/* hit-area invisível com o MESMO d do traço visível */}
      {runs.map(({ d }, i) => (
        <path
          key={`hit-${i}`}
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {/* casing na cor do fundo, POR LINHA (logo antes do traço colorido):
          é o que faz a linha desenhada depois "cortar" a anterior com um
          respiro nos cruzamentos — não mover para um layer global */}
      {runs.map(({ d }, i) => (
        <path
          key={`c-${i}`}
          d={d}
          fill="none"
          stroke="var(--map-surface)"
          strokeWidth={width + 3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {runs.map(({ d, style }, i) => (
        <path
          key={`l-${i}`}
          d={d}
          fill="none"
          stroke={line.color}
          strokeWidth={width}
          strokeDasharray={TRACK_STYLES[style].dash}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isSelected ? 1 : 0.95}
        />
      ))}
    </g>
  )
}
