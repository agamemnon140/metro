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
 * Rótulos de estação com tamanho de tela ~constante (contra-escalados pelo zoom)
 * e anti-colisão: ao afastar, mostra só os prioritários (baldeações/terminais);
 * ao aproximar, revela mais. Cada nome tem um fundo branco colado à estação.
 */
export function LabelsLayer({ stations }: { stations: Station[] }) {
  const scale = useZoom((s) => s.scale)
  const mode = useViewMode((s) => s.mode)
  const selection = useSelection((s) => s.selection)
  const labelMode = useLabelMode((s) => s.mode)
  const focusLine = selection?.kind === 'line' ? selection.id : null

  const labels = useMemo(() => {
    if (labelMode === 'off' && !focusLine) return []
    const base = labelMode === 'small' ? 30 : 42
    const fs = Math.max(5, base / scale) // unidades de SVG; ~constante na tela
    const charW = fs * 0.52
    const padX = fs * 0.35

    let cands = stations
    if (focusLine) cands = stations.filter((s) => s.lineIds.includes(focusLine))
    const prio = (s: Station) => (s.interchange ? 0 : s.labelTier ?? 3)
    cands = [...cands].sort((a, b) => prio(a) - prio(b))

    const placed: Box[] = []
    const out: { s: Station; x: number; y: number; w: number; h: number }[] = []
    const h = fs * 1.15
    for (const s of cands) {
      const p = pointFor(s, mode)
      const w = s.name.length * charW + padX * 2
      const x = p.x + 6 + padX
      const y = p.y
      const box: Box = { x1: p.x, y1: y - h / 2, x2: x + w, y2: y + h / 2 }
      const hit = placed.some(
        (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2),
      )
      if (hit && !focusLine) continue
      placed.push(box)
      out.push({ s, x, y, w, h })
    }
    return { items: out, fs }
  }, [stations, scale, mode, focusLine, labelMode])

  if (!('items' in labels)) return null
  const { items, fs } = labels

  return (
    <g pointerEvents="none">
      {items.map(({ s, x, y, w, h }) => (
        <g key={s.id}>
          <rect
            x={x - fs * 0.3}
            y={y - h / 2}
            width={w}
            height={h}
            rx={fs * 0.3}
            fill="#ffffff"
            opacity={0.85}
          />
          <text
            x={x}
            y={y}
            fontSize={fs}
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
