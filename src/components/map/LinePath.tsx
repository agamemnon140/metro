import { useMemo } from 'react'
import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { pointFor } from '@/lib/coords'
import { useSelection } from '@/hooks/useSelection'

interface Props {
  line: Line
}

export function LinePath({ line }: Props) {
  const selectLine = useSelection((s) => s.selectLine)
  const selection = useSelection((s) => s.selection)

  const points = useMemo(() => {
    return stationsForLine(line)
      .map((s) => {
        const p = pointFor(s)
        return `${p.x},${p.y}`
      })
      .join(' ')
  }, [line])

  if (!points) return null

  const isSelected = selection?.kind === 'line' && selection.id === line.id
  const dashed = line.status === 'construcao' || line.status === 'planejamento'

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
        strokeDasharray={dashed ? '2 12' : undefined}
        opacity={isSelected ? 1 : 0.95}
      />
    </g>
  )
}
