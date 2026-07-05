import { useMemo } from 'react'
import type { ViewMode } from '@/lib/coords'
import { geoToPoint } from '@/lib/coords'
import { roundedPath } from '@/lib/geometry'
import { RIVERS } from '@/data/rivers'

// Camada decorativa (não interativa) com os rios Tietê e Pinheiros.
// Renderizar como PRIMEIRO filho do <svg>, embaixo do casing e das linhas.
export function RiversLayer({ mode }: { mode: ViewMode }) {
  const rivers = useMemo(() => {
    return RIVERS.map((river) => {
      const pts =
        mode === 'geographic'
          ? river.geo.map((g) => geoToPoint(g.lat, g.lng))
          : river.schematic
      const label =
        mode === 'geographic'
          ? geoToPoint(river.label.geographic.lat, river.label.geographic.lng)
          : river.label.schematic
      return {
        id: river.id,
        name: river.name,
        d: roundedPath(pts, mode === 'schematic' ? 24 : 10),
        label,
      }
    })
  }, [mode])

  const strokeWidth = mode === 'schematic' ? 14 : 9
  const fontSize = mode === 'schematic' ? 13 : 10

  return (
    <g pointerEvents="none" aria-hidden="true">
      {rivers.map((r) => (
        <g key={r.id}>
          <path
            d={r.d}
            fill="none"
            stroke="var(--map-river)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
          <text
            x={r.label.x}
            y={r.label.y}
            fontSize={fontSize}
            fontStyle="italic"
            fill="var(--map-river)"
            textAnchor="middle"
          >
            {r.name}
          </text>
        </g>
      ))}
    </g>
  )
}
