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

// traço por bloco (operando = sólido)
const DASH: Record<string, string | undefined> = {
  operando: undefined,
  construcao: '8 7',
  estudo: '2 8',
  especulacao: '1 9',
}

export function LinePath({ line }: Props) {
  const selectLine = useSelection((s) => s.selectLine)
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const layers = useLayers()

  // Quebra a linha em trechos contínuos visíveis; cada trecho herda o traço do
  // bloco "menos pronto" das suas pontas. Trechos com estação oculta somem.
  const runs = useMemo(() => {
    const sts = stationsForLine(line, mode)
    const pt = (s: Station) => {
      const p = pointFor(s, mode)
      return `${p.x},${p.y}`
    }
    const rank = { operando: 0, construcao: 1, estudo: 2, especulacao: 3 } as const
    const out: { pts: string[]; dash: string | undefined }[] = []
    let cur: { pts: string[]; dash: string | undefined } | null = null
    for (let i = 0; i < sts.length - 1; i++) {
      const a = sts[i]
      const b = sts[i + 1]
      if (!isPhaseVisible(a, layers) || !isPhaseVisible(b, layers)) {
        cur = null
        continue
      }
      const pa = a.phase ?? 'operando'
      const pb = b.phase ?? 'operando'
      const worst = rank[pa] >= rank[pb] ? pa : pb
      const dash = line.intercity ? '3 9' : DASH[worst]
      if (cur && cur.dash === dash) cur.pts.push(pt(b))
      else {
        cur = { pts: [pt(a), pt(b)], dash }
        out.push(cur)
      }
    }
    return out.map((r) => ({ points: r.pts.join(' '), dash: r.dash }))
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
      {runs.map((r, i) => (
        <polyline
          key={`hit-${i}`}
          points={r.points}
          fill="none"
          stroke="transparent"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {runs.map((r, i) => (
        <polyline
          key={`l-${i}`}
          points={r.points}
          fill="none"
          stroke={line.color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={r.dash}
          opacity={isSelected ? 1 : 0.95}
        />
      ))}
    </g>
  )
}
