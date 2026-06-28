// Pipeline de dados: fonte curada (network.curated.json) + OSM (scratch/osm.json)
// -> src/data/network.json (gerado).
//
// - Casa estações curadas <-> OSM por PROXIMIDADE geográfica (resolve nomes
//   patrocinados do OSM, ex. "Japão-Liberdade" -> "liberdade").
// - Preenche a posição esquemática das estações novas por transformação AFIM
//   ajustada às estações curadas (mínimos quadrados geo -> x/y).
// - Linhas futuras (19/20/22) recebem traçado INDICATIVO (não oficial).
// - stationOrder passa a ser completo (todas as estações), em ambos os modos.
//
// Uso: node scripts/build-network.mjs

import { readFileSync, writeFileSync } from 'node:fs'

const osm = JSON.parse(readFileSync('scratch/osm.json', 'utf8'))
const net = JSON.parse(readFileSync('src/data/network.curated.json', 'utf8'))

const TARGET = new Set(['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '15', '17'])

// traçado indicativo (NÃO oficial) das linhas em projeto/estudo: [nome, lat, lng, tier]
const INDICATIVE = {
  '19': [['Campo Belo', -23.616, -46.668, 1], ['Trecho central', -23.553, -46.64, 3], ['Bosque Maia (Guarulhos)', -23.452, -46.533, 1]],
  '20': [['Lapa', -23.52, -46.7, 1], ['Trecho central', -23.55, -46.633, 3], ['Santo André', -23.654, -46.532, 1]],
  '22': [['Cotia', -23.602, -46.919, 1], ['Taboão da Serra', -23.61, -46.79, 3], ['Zona Oeste', -23.59, -46.73, 1]],
}

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const round = (n) => Math.round(n * 1e5) / 1e5
const round1 = (n) => Math.round(n * 10) / 10

function dist(a, b) {
  const R = 6371000
  const toR = (x) => (x * Math.PI) / 180
  const dLat = toR(b.lat - a.lat)
  const dLng = toR(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// estações (preserva curadas)
const stations = new Map()
for (const s of net.stations) stations.set(s.id, { ...s, lineIds: new Set(s.lineIds) })
const handList = [...stations.values()].filter((s) => s.schematic)

const THRESH = 300 // metros
function resolveId(name, lat, lng) {
  const id = slug(name)
  if (stations.has(id)) return id
  let best = null
  let bd = THRESH
  for (const h of handList) {
    const d = dist({ lat, lng }, h.geo)
    if (d < bd) { bd = d; best = h.id }
  }
  return best || id
}

const orderByLine = new Map()

// melhor variante OSM por ref
const bestByRef = new Map()
for (const rel of osm) {
  if (!TARGET.has(rel.ref)) continue
  const c = bestByRef.get(rel.ref)
  if (!c || rel.count > c.count) bestByRef.set(rel.ref, rel)
}
for (const [ref, rel] of bestByRef) {
  const order = []
  let prev = null
  for (const stop of rel.stops) {
    const id = resolveId(stop.name, stop.lat, stop.lng)
    if (id === prev) continue
    prev = id
    order.push(id)
    if (stations.has(id)) {
      const st = stations.get(id)
      st.geo = { lat: round(stop.lat), lng: round(stop.lng) }
      st.lineIds.add(ref)
    } else {
      stations.set(id, {
        id, name: stop.name, lineIds: new Set([ref]),
        interchange: false, geo: { lat: round(stop.lat), lng: round(stop.lng) }, labelTier: 3,
      })
    }
  }
  orderByLine.set(ref, order)
}

// linhas futuras indicativas
for (const [ref, stops] of Object.entries(INDICATIVE)) {
  const order = []
  for (const [name, lat, lng, tier] of stops) {
    const id = `l${ref}-${slug(name)}`
    order.push(id)
    if (!stations.has(id)) {
      stations.set(id, { id, name, lineIds: new Set([ref]), interchange: false, geo: { lat, lng }, labelTier: tier })
    } else stations.get(id).lineIds.add(ref)
  }
  orderByLine.set(ref, order)
}

// demais linhas (6,16,...): adiciona lineIds às suas estações
for (const line of net.lines) {
  if (orderByLine.has(line.id)) continue
  for (const id of line.stationOrder) if (stations.has(id)) stations.get(id).lineIds.add(line.id)
}

// terminais
const terminals = new Set()
const allOrders = [...orderByLine.values(), ...net.lines.map((l) => l.stationOrder)]
for (const o of allOrders) if (o.length) { terminals.add(o[0]); terminals.add(o[o.length - 1]) }

for (const st of stations.values()) {
  st.interchange = st.interchange || st.lineIds.size > 1
  if (!st.schematic) st.labelTier = st.interchange ? 1 : terminals.has(st.id) ? 1 : st.labelTier || 3
}

// linhas: OSM operacionais MANTÊM o esquemático curado (bonito) e ganham
// geoOrder completo; futuras (indicativas) entram nos dois modos.
const FUTURE = new Set(Object.keys(INDICATIVE))
const lines = net.lines.map((line) => {
  const order = orderByLine.get(line.id)
  if (!order) return { ...line, geoOrder: line.stationOrder }
  if (FUTURE.has(line.id)) return { ...line, drawn: true, stationOrder: order, geoOrder: order }
  return { ...line, geoOrder: order } // stationOrder curado preservado
})

// estações que precisam de posição esquemática (aparecem em algum stationOrder)
const needSchem = new Set(lines.flatMap((l) => l.stationOrder))

// ajuste afim geo -> esquemático SÓ para as que faltam (ex.: futuras indicativas)
const cp = handList.map((s) => ({ lng: s.geo.lng, lat: s.geo.lat, x: s.schematic.x, y: s.schematic.y }))
const fitX = fit(cp, 'x')
const fitY = fit(cp, 'y')
for (const st of stations.values()) {
  if (st.schematic || !needSchem.has(st.id)) continue
  st.schematic = {
    x: round1(fitX[0] * st.geo.lng + fitX[1] * st.geo.lat + fitX[2]),
    y: round1(fitY[0] * st.geo.lng + fitY[1] * st.geo.lat + fitY[2]),
  }
}

// viewBox esquemático cobre as estações COM schematic
let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9
for (const st of stations.values()) {
  if (!st.schematic) continue
  minX = Math.min(minX, st.schematic.x); maxX = Math.max(maxX, st.schematic.x)
  minY = Math.min(minY, st.schematic.y); maxY = Math.max(maxY, st.schematic.y)
}
const PAD = 60
for (const st of stations.values()) {
  if (!st.schematic) continue
  st.schematic = { x: round1(st.schematic.x - minX + PAD), y: round1(st.schematic.y - minY + PAD) }
}
const viewBox = { width: Math.ceil(maxX - minX + 2 * PAD), height: Math.ceil(maxY - minY + 2 * PAD) }

// serializa
const stationsOut = [...stations.values()].map((s) => {
  const out = {
    id: s.id, name: s.name,
    lineIds: [...s.lineIds].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b)),
    interchange: s.interchange,
  }
  if (s.schematic) out.schematic = s.schematic
  out.geo = s.geo
  out.labelTier = s.labelTier
  if (s.labelAnchor) out.labelAnchor = s.labelAnchor
  if (s.labelOffset) out.labelOffset = s.labelOffset
  return out
})

writeFileSync(
  'src/data/network.json',
  JSON.stringify({ version: '0.3.0', updatedAt: net.updatedAt, viewBox, lines, stations: stationsOut }, null, 2) + '\n',
)

console.log('Estações:', stationsOut.length, '| com schematic:', stationsOut.filter((s) => s.schematic).length, '| viewBox', viewBox.width + 'x' + viewBox.height)
console.log('Linhas desenhadas:', lines.filter((l) => l.drawn).map((l) => l.number).join(', '))

// --- mínimos quadrados 3 params ---
function fit(points, key) {
  let Sll = 0, Sla = 0, Sl = 0, Saa = 0, Sa = 0, N = points.length, Svl = 0, Sva = 0, Sv = 0
  for (const p of points) {
    const l = p.lng, a = p.lat, v = p[key]
    Sll += l * l; Sla += l * a; Sl += l; Saa += a * a; Sa += a; Svl += v * l; Sva += v * a; Sv += v
  }
  return solve3([[Sll, Sla, Sl], [Sla, Saa, Sa], [Sl, Sa, N]], [Svl, Sva, Sv])
}
function solve3(A, b) {
  const m = [[...A[0], b[0]], [...A[1], b[1]], [...A[2], b[2]]]
  for (let i = 0; i < 3; i++) {
    let piv = i
    for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[piv][i])) piv = r
    ;[m[i], m[piv]] = [m[piv], m[i]]
    const d = m[i][i]
    for (let c = i; c < 4; c++) m[i][c] /= d
    for (let r = 0; r < 3; r++) if (r !== i) { const f = m[r][i]; for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c] }
  }
  return [m[0][3], m[1][3], m[2][3]]
}
