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

const TARGET = new Set(['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '15'])

// traçado INDICATIVO (não oficial) das linhas em projeto/estudo.
// {ref} reaproveita uma estação real existente (conexão confirmada pelo metrôCPTM);
// senão {name,lat,lng,tier} cria um nó indicativo.
const INDICATIVE = {
  // 6-Laranja (em obras): Brasilândia <-> São Joaquim (estações reais)
  '6': [
    { name: 'Brasilândia', lat: -23.46, lng: -46.69, tier: 1 },
    { name: 'Maristela', lat: -23.47, lng: -46.688, tier: 3 },
    { name: 'Itaberaba', lat: -23.478, lng: -46.69, tier: 3 },
    { name: 'João Paulo I', lat: -23.488, lng: -46.687, tier: 3 },
    { name: 'Freguesia do Ó', lat: -23.498, lng: -46.69, tier: 2 },
    { name: 'Santa Marina', lat: -23.515, lng: -46.682, tier: 3 },
    { name: 'Água Branca', lat: -23.524, lng: -46.678, tier: 3 },
    { name: 'SESC-Pompeia', lat: -23.527, lng: -46.674, tier: 3 },
    { name: 'Perdizes', lat: -23.535, lng: -46.672, tier: 3 },
    { name: 'PUC-Cardoso de Almeida', lat: -23.543, lng: -46.667, tier: 3 },
    { name: 'FAAP-Pacaembu', lat: -23.547, lng: -46.662, tier: 3 },
    { ref: 'higienopolis-mackenzie' },
    { name: '14 Bis-Saracura', lat: -23.557, lng: -46.645, tier: 3 },
    { name: 'Bela Vista', lat: -23.562, lng: -46.642, tier: 3 },
    { ref: 'sao-joaquim' },
  ],
  // 17-Ouro: São Paulo-Morumbi <-> Jabaquara-CPB (traçado completo planejado)
  '17': [
    { ref: 'sao-paulo-morumbi' },
    { name: 'Estádio Morumbi', lat: -23.595, lng: -46.715, tier: 3 },
    { name: 'Américo Maurano', lat: -23.602, lng: -46.722, tier: 3 },
    { name: 'Paraisópolis', lat: -23.608, lng: -46.725, tier: 3 },
    { name: 'Panamby', lat: -23.615, lng: -46.722, tier: 3 },
    { name: 'Morumbi', lat: -23.622, lng: -46.713, tier: 3 },
    { name: 'Chucri Zaidan', lat: -23.615, lng: -46.7, tier: 3 },
    { name: 'Vila Cordeiro', lat: -23.62, lng: -46.69, tier: 3 },
    { ref: 'campo-belo' },
    { name: 'Vereador José Diniz', lat: -23.62, lng: -46.66, tier: 3 },
    { name: 'Brooklin Paulista', lat: -23.625, lng: -46.655, tier: 3 },
    { name: 'Aeroporto de Congonhas', lat: -23.627, lng: -46.65, tier: 1 },
    { name: 'Washington Luís', lat: -23.63, lng: -46.645, tier: 3 },
    { name: 'Vila Paulista', lat: -23.635, lng: -46.642, tier: 3 },
    { name: 'Vila Babilônia', lat: -23.64, lng: -46.638, tier: 3 },
    { name: 'Cidade Leonor', lat: -23.643, lng: -46.632, tier: 3 },
    { name: 'Hospital Sabóia', lat: -23.646, lng: -46.628, tier: 3 },
    { name: 'Jabaquara-CPB', lat: -23.646, lng: -46.62, tier: 1 },
  ],
  // 19-Celeste: Anhangabaú <-> Bosque Maia (Guarulhos) — estações do projeto
  '19': [
    { ref: 'anhangabau' },
    { ref: 'sao-bento' },
    { name: 'Cerealistas', lat: -23.538, lng: -46.632, tier: 3 },
    { name: 'Silva Teles', lat: -23.535, lng: -46.63, tier: 3 },
    { name: 'Catumbi', lat: -23.53, lng: -46.628, tier: 3 },
    { name: 'Vila Maria', lat: -23.518, lng: -46.625, tier: 3 },
    { name: 'Santo Eduardo', lat: -23.518, lng: -46.616, tier: 3 },
    { name: 'Cerejeiras', lat: -23.513, lng: -46.608, tier: 3 },
    { name: 'Vila Sabrina', lat: -23.508, lng: -46.6, tier: 3 },
    { name: 'Jardim Julieta', lat: -23.498, lng: -46.588, tier: 3 },
    { name: 'Itapegica', lat: -23.488, lng: -46.572, tier: 3 },
    { name: 'Dutra', lat: -23.482, lng: -46.556, tier: 3 },
    { name: 'Vila Augusta', lat: -23.468, lng: -46.545, tier: 3 },
    { name: 'Guarulhos Centro', lat: -23.462, lng: -46.534, tier: 1 },
    { name: 'Bosque Maia', lat: -23.452, lng: -46.533, tier: 1 },
  ],
  // 20-Rosa: Santa Marina <-> Santo André — estações do projeto
  '20': [
    { ref: 'l6-santa-marina' },
    { ref: 'lapa' },
    { name: 'Vila Romana', lat: -23.525, lng: -46.695, tier: 3 },
    { name: 'Cerro Corá', lat: -23.535, lng: -46.692, tier: 3 },
    { name: 'Girassol', lat: -23.545, lng: -46.69, tier: 3 },
    { name: 'Teodoro Sampaio', lat: -23.555, lng: -46.688, tier: 3 },
    { ref: 'fradique-coutinho' },
    { name: 'Tabapuã', lat: -23.585, lng: -46.675, tier: 3 },
    { name: 'Jesuíno Cardoso', lat: -23.595, lng: -46.67, tier: 3 },
    { name: 'Hélio Pellegrino', lat: -23.6, lng: -46.665, tier: 3 },
    { ref: 'moema' },
    { name: 'Rubem Berta', lat: -23.608, lng: -46.645, tier: 3 },
    { name: 'Indianópolis', lat: -23.612, lng: -46.64, tier: 3 },
    { ref: 'saude' },
    { name: 'Abraão de Morais', lat: -23.625, lng: -46.635, tier: 3 },
    { name: 'Cursino', lat: -23.63, lng: -46.625, tier: 3 },
    { name: 'Jardim Clímax', lat: -23.638, lng: -46.615, tier: 3 },
    { name: 'Liviero', lat: -23.645, lng: -46.6, tier: 3 },
    { name: 'Taboão-Paulicéia', lat: -23.66, lng: -46.58, tier: 3 },
    { name: 'Rudge Ramos', lat: -23.665, lng: -46.565, tier: 3 },
    { name: 'Afonsina', lat: -23.665, lng: -46.55, tier: 3 },
    { name: 'Príncipe de Gales', lat: -23.66, lng: -46.54, tier: 3 },
    { name: 'Portugal', lat: -23.657, lng: -46.535, tier: 3 },
    { ref: 'santo-andre' },
  ],
  // 22-Marrom: Cotia/Granja Viana <-> Sumaré (Linha 2-Verde)
  '22': [
    { name: 'Cotia', lat: -23.604, lng: -46.919, tier: 1 },
    { name: 'Granja Viana', lat: -23.585, lng: -46.84, tier: 3 },
    { name: 'Raposo Tavares', lat: -23.573, lng: -46.745, tier: 3 },
    { name: 'Rio Pequeno', lat: -23.566, lng: -46.73, tier: 3 },
    { ref: 'sumare' },
  ],
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
  for (const stop of stops) {
    let id
    if (stop.ref) {
      id = stop.ref
      if (stations.has(id)) stations.get(id).lineIds.add(ref)
    } else {
      id = `l${ref}-${slug(stop.name)}`
      if (!stations.has(id)) {
        stations.set(id, {
          id, name: stop.name, lineIds: new Set([ref]),
          interchange: false, geo: { lat: stop.lat, lng: stop.lng }, labelTier: stop.tier,
        })
      } else stations.get(id).lineIds.add(ref)
    }
    order.push(id)
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

// 1) interpola posições faltantes entre estações-âncora (com schematic) ao longo
//    de cada linha, proporcional à distância geográfica — mantém o traço reto.
for (const line of lines) {
  const order = line.stationOrder
  let i = 0
  while (i < order.length) {
    if (stations.get(order[i])?.schematic) { i++; continue }
    let j = i
    while (j < order.length && !stations.get(order[j])?.schematic) j++
    const prev = i > 0 ? stations.get(order[i - 1]) : null
    const next = j < order.length ? stations.get(order[j]) : null
    if (prev?.schematic && next?.schematic) {
      const seq = [prev, ...order.slice(i, j).map((id) => stations.get(id)), next]
      const seg = []
      let total = 0
      for (let k = 1; k < seq.length; k++) { const d = dist(seq[k - 1].geo, seq[k].geo) || 1; seg.push(d); total += d }
      let acc = 0
      for (let k = 0; k < j - i; k++) {
        acc += seg[k]
        const f = acc / total
        const st = stations.get(order[i + k])
        st.schematic = {
          x: round1(prev.schematic.x + (next.schematic.x - prev.schematic.x) * f),
          y: round1(prev.schematic.y + (next.schematic.y - prev.schematic.y) * f),
        }
      }
    }
    i = j
  }
}

// 2) ajuste afim geo -> esquemático para o que sobrou (pontas sem âncora dos dois lados)
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
