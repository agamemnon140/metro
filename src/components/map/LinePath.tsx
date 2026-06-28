import { useMemo } from 'react'
import type { Line, Station } from '@/types/network'
import { stationsForLine, isPhaseVisible } from '@/lib/network'
import { pointFor } from '@/lib/coords'
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

  // Trechos contínuos de estações visíveis (uma polyline por trecho). Estações
  // ocultas (bloco desligado) quebram o traço; o resto fica sólido e único.
  const runs = useMemo(() => {
    const sts = stationsForLine(line, mode)
    const pt = (s: Station) => {
      const p = pointFor(s, mode)
      return `${p.x},${p.y}`
    }
    const out: string[][] = []
    let cur: string[] | null = null
    for (const s of sts) {
      if (!isPhaseVisible(s, layers)) {
        cur = null
        continue
      }
      if (!cur) {
        cur = []
        out.push(cur)
      }
      cur.push(pt(s))
    }
    return out.filter((r) => r.length >= 2).map((r) => r.join(' '))
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
      opacity={dimmed ? 0.1 : 1}
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
      {runs.map((pts, i) => (
        <polyline
          key={`hit-${i}`}
          points={pts}
          fill="none"
          stroke="transparent"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {runs.map((pts, i) => (
        <polyline
          key={`l-${i}`}
          points={pts}
          fill="none"
          stroke={line.color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isSelected ? 1 : 0.95}
        />
      ))}
    </g>
  )
}
