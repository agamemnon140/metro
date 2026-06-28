import type { SchematicPoint, Station } from '@/types/network'
import { pointFor } from '@/lib/coords'
import { tierForScale, useZoom } from '@/hooks/useZoomLevel'
import { useViewMode } from '@/hooks/useViewMode'

interface Props {
  station: Station
}

function defaultOffset(anchor: 'start' | 'middle' | 'end'): SchematicPoint {
  if (anchor === 'end') return { x: -10, y: 4 }
  if (anchor === 'middle') return { x: 0, y: -12 }
  return { x: 10, y: 4 }
}

export function StationLabel({ station }: Props) {
  const scale = useZoom((s) => s.scale)
  const mode = useViewMode((s) => s.mode)
  const currentTier = tierForScale(scale, mode)

  if (station.labelTier > currentTier) return null
  // no geográfico (denso), no zoom mais aberto só rotula baldeações
  if (mode === 'geographic' && currentTier === 1 && !station.interchange) return null

  const p = pointFor(station, mode)
  const anchor = station.labelAnchor ?? 'start'
  const off = station.labelOffset ?? defaultOffset(anchor)
  const x = p.x + off.x
  const y = p.y + off.y

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline={anchor === 'middle' ? 'auto' : 'middle'}
      fontSize={station.interchange ? 12 : 10.5}
      fontWeight={station.interchange ? 700 : 500}
      fill="#1a1a1a"
      pointerEvents="none"
      style={{ paintOrder: 'stroke' }}
      stroke="#ffffff"
      strokeWidth={3}
      strokeLinejoin="round"
    >
      {station.name}
    </text>
  )
}
