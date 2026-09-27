import { useMemo } from 'react'
import type { Station } from '@/types/network'
import { pointFor } from '@/lib/coords'
import { useZoom } from '@/hooks/useZoomLevel'
import { useViewMode } from '@/hooks/useViewMode'
import { useSelection } from '@/hooks/useSelection'
import { useLabelMode } from '@/hooks/useLabelMode'
import { getLine, isStationVisibleOnLine } from '@/lib/network'
import { useLayers } from '@/hooks/useLayers'

interface Box {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Rótulos com tamanho de tela ~constante (contra-escala pelo zoom), centrados
 * acima da estação e com anti-colisão. Padrão: só baldeações (hubs). "Todos"
 * revela as demais conforme há espaço; ao focar uma linha, mostra as dela.
 */
export function LabelsLayer({ stations, viewportScale }: { stations: Station[]; viewportScale: number }) {
  const scale = useZoom((s) => s.scale)
  const mode = useViewMode((s) => s.mode)
  const selection = useSelection((s) => s.selection)
  const labelMode = useLabelMode((s) => s.mode)
  const layers = useLayers()
  const focusLine = selection?.kind === 'line' ? selection.id : null
  const focusStation = selection?.kind === 'station' ? selection.id : null

  const result = useMemo(() => {
    // Account for both SVG fitting and user zoom, including narrow screens.
    const fs = 12 / (viewportScale * scale)
    const charW = fs * 0.52
    const padX = fs * 0.4
    const lift = fs * 0.95 // distância do nome acima da estação

    let cands: Station[]
    if (labelMode === 'off') cands = []
    else if (focusLine) cands = stations.filter((s) => isStationVisibleOnLine(s, getLine(focusLine)!, layers))
    else if (labelMode === 'hubs') cands = stations.filter((s) => s.interchange || s.id === focusStation)
    else cands = stations

    const prio = (s: Station) => s.id === focusStation ? -1 : (s.interchange ? 0 : s.labelTier ?? 3)
    cands = [...cands].sort((a, b) => prio(a) - prio(b))

    const placed: Box[] = []
    const out: { s: Station; cx: number; y: number; w: number; h: number }[] = []
    const h = fs * 1.25
    for (const s of cands) {
      const p = pointFor(s, mode)
      const w = s.name.length * charW + padX * 2
      const cx = p.x
      // Try above, then below; focusing a line must still avoid collisions.
      for (const y of [p.y - lift, p.y + lift]) {
        const gap = fs * 0.15
        const box: Box = { x1: cx - w / 2 - gap, y1: y - h / 2 - gap, x2: cx + w / 2 + gap, y2: y + h / 2 + gap }
        const hit = placed.some(
          (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2),
        )
        if (hit) continue
        placed.push(box)
        out.push({ s, cx, y, w, h })
        break
      }
    }
    return { items: out, fs }
  }, [stations, scale, viewportScale, mode, focusLine, focusStation, labelMode, layers])

  const { items, fs } = result

  return (
    <g pointerEvents="none" data-station-labels>
      {items.map(({ s, cx, y, w, h }) => (
        <g key={s.id}>
          {s.id === focusStation && <rect
            x={cx - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            rx={fs * 0.3}
            fill="var(--map-label-bg)"
            stroke="var(--map-station-ring)"
            strokeWidth={fs * 0.05}
          />}
          <text
            x={cx}
            y={y}
            fontSize={fs}
            textAnchor="middle"
            dominantBaseline="central"
            fontWeight={s.interchange ? 700 : 500}
            fill="var(--map-label-text)"
            stroke={s.id === focusStation ? 'none' : 'var(--map-surface)'}
            strokeWidth={fs * 0.22}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {s.name}
          </text>
        </g>
      ))}
    </g>
  )
}
