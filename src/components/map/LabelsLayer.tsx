import { useMemo } from 'react'
import type { Station } from '@/types/network'
import { pointFor } from '@/lib/coords'
import { useZoom } from '@/hooks/useZoomLevel'
import { useViewMode } from '@/hooks/useViewMode'
import { useSelection } from '@/hooks/useSelection'
import { useLabelMode } from '@/hooks/useLabelMode'

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
export function LabelsLayer({ stations }: { stations: Station[] }) {
  const scale = useZoom((s) => s.scale)
  const mode = useViewMode((s) => s.mode)
  const selection = useSelection((s) => s.selection)
  const labelMode = useLabelMode((s) => s.mode)
  const focusLine = selection?.kind === 'line' ? selection.id : null

  const result = useMemo(() => {
    // tamanho de tela ~constante; limitado p/ não explodir ao afastar
    const fs = Math.min(34, Math.max(7, 26 / scale))
    const charW = fs * 0.52
    const padX = fs * 0.4
    const lift = fs * 0.95 // distância do nome acima da estação

    let cands: Station[]
    if (focusLine) cands = stations.filter((s) => s.lineIds.includes(focusLine))
    else if (labelMode === 'off') cands = []
    else if (labelMode === 'hubs') cands = stations.filter((s) => s.interchange)
    else cands = stations

    const prio = (s: Station) => (s.interchange ? 0 : s.labelTier ?? 3)
    cands = [...cands].sort((a, b) => prio(a) - prio(b))

    const placed: Box[] = []
    const out: { s: Station; cx: number; y: number; w: number; h: number }[] = []
    const h = fs * 1.25
    for (const s of cands) {
      const p = pointFor(s, mode)
      const w = s.name.length * charW + padX * 2
      const cx = p.x
      const y = p.y - lift
      const box: Box = { x1: cx - w / 2, y1: y - h / 2, x2: cx + w / 2, y2: y + h / 2 }
      const hit = placed.some(
        (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2),
      )
      if (hit && !focusLine) continue
      placed.push(box)
      out.push({ s, cx, y, w, h })
    }
    return { items: out, fs }
  }, [stations, scale, mode, focusLine, labelMode])

  const { items, fs } = result

  return (
    <g pointerEvents="none">
      {items.map(({ s, cx, y, w, h }) => (
        <g key={s.id}>
          <rect
            x={cx - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            rx={fs * 0.3}
            fill="#ffffff"
            opacity={0.88}
          />
          <text
            x={cx}
            y={y}
            fontSize={fs}
            textAnchor="middle"
            dominantBaseline="central"
            fontWeight={s.interchange ? 700 : 500}
            fill="#1a1a1a"
          >
            {s.name}
          </text>
        </g>
      ))}
    </g>
  )
}
