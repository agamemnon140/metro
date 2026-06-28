import { useMemo } from 'react'
import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { pointFor } from '@/lib/coords'
import { useSelection } from '@/hooks/useSelection'
import { useViewMode } from '@/hooks/useViewMode'

interface Props {
  line: Line
}

export function LinePath({ line }: Props) {
  const selectLine = useSelection((s) => s.selectLine)
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)

  const points = useMemo(() => {
    return stationsForLine(line, mode)
      .map((s) => {
        const p = pointFor(s, mode)
        return `${p.x},${p.y}`
      })
      .join(' ')
  }, [line, mode])

  if (!points) return null

  const isSelected = selection?.kind === 'line' && selection.id === line.id
  // traço fica mais "esparso" quanto menos maduro o projeto
  const dashByStatus: Record<string, string | undefined> = {
    operacao: undefined,
    expansao: undefined,
    construcao: '10 8',
    contratacao: '6 9',
    elaboracao: '3 10',
    estudo: '1 12',
  }
  const dashArray = dashByStatus[line.status]

  return (
    <g
      role="button"
      aria-label={`Linha ${line.fullName}`}
      tabIndex={0}
      className="cursor-pointer focus:outline-none"
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
      {/* alvo invisível largo, facilita o toque */}
      <polyline
        points={points}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="none"
        stroke={line.color}
        strokeWidth={isSelected ? 9 : 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashArray}
        opacity={isSelected ? 1 : 0.95}
      />
    </g>
  )
}
