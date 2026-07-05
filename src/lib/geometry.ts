export interface Pt {
  x: number
  y: number
}

const EPS = 0.01

const fmt = (n: number) => {
  const s = n.toFixed(2)
  return s.endsWith('.00') ? s.slice(0, -3) : s
}

/**
 * Converte uma polyline em path SVG com cantos arredondados (fillet).
 * Em cada vértice interno, encurta os segmentos adjacentes por
 * ri = min(r, d1/2, d2/2) e insere uma curva quadrática usando o vértice
 * original como ponto de controle. Vértices quase colineares viram `L`
 * simples. Os pontos extremos (estações terminais) não mudam; a curva
 * desvia do vértice no máximo ri·(1−cos(θ/2)) — abaixo da meia-espessura
 * do traço para os raios usados no app.
 */
export function roundedPath(points: Pt[], r: number): string {
  // remove pontos consecutivos duplicados (evitaria NaN na normalização)
  const pts: Pt[] = []
  for (const p of points) {
    const last = pts[pts.length - 1]
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > EPS) pts.push(p)
  }
  if (pts.length < 2) return ''

  let d = `M ${fmt(pts[0].x)},${fmt(pts[0].y)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1]
    const p = pts[i]
    const b = pts[i + 1]
    const v1 = { x: p.x - a.x, y: p.y - a.y }
    const v2 = { x: b.x - p.x, y: b.y - p.y }
    const d1 = Math.hypot(v1.x, v1.y)
    const d2 = Math.hypot(v2.x, v2.y)
    const cross = (v1.x * v2.y - v1.y * v2.x) / (d1 * d2)
    if (Math.abs(cross) < 0.02) {
      d += ` L ${fmt(p.x)},${fmt(p.y)}`
      continue
    }
    const ri = Math.min(r, d1 / 2, d2 / 2)
    const pin = { x: p.x - (v1.x / d1) * ri, y: p.y - (v1.y / d1) * ri }
    const pout = { x: p.x + (v2.x / d2) * ri, y: p.y + (v2.y / d2) * ri }
    d += ` L ${fmt(pin.x)},${fmt(pin.y)} Q ${fmt(p.x)},${fmt(p.y)} ${fmt(pout.x)},${fmt(pout.y)}`
  }
  const last = pts[pts.length - 1]
  d += ` L ${fmt(last.x)},${fmt(last.y)}`
  return d
}
