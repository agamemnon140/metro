// Pipeline de dados: network.curated.json + OSM (scratch/osm.json) -> network.json
//
// - OSM: linhas operacionais (estações reais ordenadas + coordenadas).
// - MANUAL: linhas definidas à mão (6/16/17/19/20/22) com estações reais/projeto.
// - EXTENSIONS: estações de expansão (futuras) anexadas a linhas operacionais (2/4).
// - INTERCITY: trens intercidades (TIC/TIM) — toggle próprio.
// - Estações novas não inauguradas recebem future=true (gated por "Projetos").
// - Posição esquemática: interpolação entre âncoras + re-base afim (contínuo).

import { readFileSync, writeFileSync } from 'node:fs'

const osm = JSON.parse(readFileSync('scratch/osm.json', 'utf8'))
const net = JSON.parse(readFileSync('src/data/network.curated.json', 'utf8'))

const TARGET = new Set(['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '15'])

// helper p/ stop: r=reúsa estação existente; o=operacional (não futura)
const S = (name, lat, lng, tier = 3, o = false) => ({ name, lat, lng, tier, op: o })
const R = (ref) => ({ ref })
const E = (name, lat, lng, tier = 3) => ({ name, lat, lng, tier, phase: 'especulacao' }) // especulação

// Linhas definidas à mão (substituem stationOrder). Estações não-ref e sem op
// viram futuras, EXCETO quando a linha é majoritariamente operacional (17).
const MANUAL = {
  // 6-Laranja (obras): Brasilândia -> São Joaquim
  '6': [
    S('Brasilândia', -23.46, -46.69, 1), S('Maristela', -23.47, -46.688), S('Itaberaba', -23.478, -46.69),
    S('João Paulo I', -23.488, -46.687), S('Freguesia do Ó', -23.498, -46.69, 2), S('Santa Marina', -23.515, -46.682),
    S('Água Branca', -23.524, -46.678), S('SESC-Pompeia', -23.527, -46.674), S('Perdizes', -23.535, -46.672),
    S('PUC-Cardoso de Almeida', -23.543, -46.667), S('FAAP-Pacaembu', -23.547, -46.662), R('higienopolis-mackenzie'),
    S('14 Bis-Saracura', -23.557, -46.645), S('Bela Vista', -23.562, -46.642), R('sao-joaquim'),
  ],
  // 16-Violeta (projeto): Teodoro Sampaio -> Cidade Tiradentes
  '16': [
    S('Teodoro Sampaio', -23.555, -46.688, 1), R('oscar-freire'), S('Nove de Julho', -23.567, -46.66),
    S('Jardim Paulista', -23.572, -46.652), S('Parque Ibirapuera', -23.585, -46.655, 2), S('Dante Pazzanese', -23.595, -46.645),
    R('ana-rosa'), S('Parque Aclimação', -23.572, -46.63), S('Parque Independência', -23.585, -46.61),
    S('São Carlos', -23.58, -46.6), S('Paes de Barros', -23.57, -46.59), S('Vila Bertioga', -23.566, -46.585),
    S('Álvaro Ramos', -23.56, -46.578), S('Regente Feijó', -23.56, -46.565), S('Anália Franco', -23.566, -46.562),
    S('Abel Ferreira', -23.567, -46.555, 2), S('Renata', -23.562, -46.548), S('Cipriano Rodrigues', -23.56, -46.54),
    S('Vila Antonieta', -23.558, -46.53), S('Rio das Pedras', -23.558, -46.518), S('Jardim Brasília', -23.557, -46.505),
    S('Santa Marcelina', -23.555, -46.49), S('Colônia', -23.56, -46.475), S('Fazenda do Carmo', -23.565, -46.465),
    S('Cidade Tiradentes', -23.575, -46.455, 1),
  ],
  // 17-Ouro: São Paulo-Morumbi -> Jabaquara-CPB (op = trecho em operação 2026)
  '17': [
    R('sao-paulo-morumbi'), S('Estádio Morumbi', -23.595, -46.715, 3, true), S('Américo Maurano', -23.602, -46.722, 3, true),
    S('Paraisópolis', -23.608, -46.725, 3, true), S('Panamby', -23.615, -46.722, 3, true), S('Morumbi', -23.622, -46.713, 3, true),
    S('Chucri Zaidan', -23.615, -46.7, 3, true), S('Vila Cordeiro', -23.62, -46.69, 3, true), R('campo-belo'),
    S('Vereador José Diniz', -23.62, -46.66), S('Brooklin Paulista', -23.625, -46.655), S('Aeroporto de Congonhas', -23.627, -46.65, 1),
    S('Washington Luís', -23.63, -46.645), S('Vila Paulista', -23.635, -46.642), S('Vila Babilônia', -23.64, -46.638),
    S('Cidade Leonor', -23.643, -46.632), S('Hospital Sabóia', -23.646, -46.628), S('Jabaquara-CPB', -23.646, -46.62, 1),
  ],
  // 19-Celeste: fase 2 (especulação, Campo Belo->Anhangabaú) + fase 1 (estudo)
  '19': [
    R('campo-belo'), E('Jesuíno Maciel', -23.615, -46.665), E('Alvorada', -23.605, -46.665), E('Hélio Pellegrino', -23.6, -46.668),
    E('Itaim Bibi', -23.59, -46.675), E('Parque Ibirapuera', -23.586, -46.656), E('Jardim Paulista', -23.573, -46.653),
    R('brigadeiro'), E('Bela Vista', -23.56, -46.645), R('anhangabau'), R('sao-bento'),
    S('Cerealistas', -23.538, -46.632), S('Silva Teles', -23.535, -46.63), S('Catumbi', -23.53, -46.628),
    S('Vila Maria', -23.518, -46.625), S('Santo Eduardo', -23.518, -46.616), S('Cerejeiras', -23.513, -46.608),
    S('Vila Sabrina', -23.508, -46.6), S('Jardim Julieta', -23.498, -46.588), S('Itapegica', -23.488, -46.572),
    S('Dutra', -23.482, -46.556), S('Vila Augusta', -23.468, -46.545), S('Guarulhos Centro', -23.462, -46.534, 1),
    S('Bosque Maia', -23.452, -46.533, 1),
  ],
  // 20-Rosa (elaboração): Santa Marina -> Santo André
  '20': [
    S('Santa Marina', -23.5155, -46.6825, 1), R('lapa'), S('Vila Romana', -23.525, -46.695), S('Cerro Corá', -23.535, -46.692),
    S('Girassol', -23.545, -46.69), S('Teodoro Sampaio', -23.5555, -46.6885), R('fradique-coutinho'), S('Tabapuã', -23.585, -46.675),
    S('Jesuíno Cardoso', -23.595, -46.67), S('Hélio Pellegrino', -23.601, -46.666), R('moema'), S('Rubem Berta', -23.608, -46.645),
    S('Indianópolis', -23.612, -46.64), R('saude'), S('Abraão de Morais', -23.625, -46.635), S('Cursino', -23.63, -46.625),
    S('Jardim Clímax', -23.638, -46.615), S('Liviero', -23.645, -46.6), S('Taboão-Paulicéia', -23.66, -46.58),
    S('Rudge Ramos', -23.665, -46.565), S('Afonsina', -23.665, -46.55), S('Príncipe de Gales', -23.66, -46.54),
    S('Portugal', -23.657, -46.535), R('santo-andre'),
  ],
  // 22-Marrom (elaboração): Sumaré -> Cotia (Centro)
  '22': [
    R('sumare'), S('Teodoro Sampaio', -23.5565, -46.69), R('faria-lima'), R('hebraica-reboucas'),
    S('Vital Brasil', -23.57, -46.715), S('USP', -23.566, -46.73), S('Rio Pequeno', -23.566, -46.745),
    S('Jardim Esmeralda', -23.575, -46.76), S('Jardim Ester', -23.58, -46.77), S('Jardim Boa Vista', -23.585, -46.78),
    S('Victor Civita', -23.585, -46.795), S('Santa Maria', -23.59, -46.81), S('Granja Viana', -23.585, -46.84),
    S('Mesopotâmia', -23.595, -46.86), S('Estrada de Embu', -23.6, -46.875), S('Parque Alexandra', -23.605, -46.89),
    S('Sabiá', -23.608, -46.905), S('Santo Antônio', -23.61, -46.918), S('Cotia (Centro)', -23.604, -46.92, 1),
  ],
}

// Estações de expansão (futuras) anexadas a linhas operacionais.
const EXTENSIONS = {
  // 2-Verde: Vila Prudente -> Penha
  '2': [
    S('Orfanato', -23.58, -46.575), S('Santa Clara', -23.573, -46.568), S('Anália Franco', -23.566, -46.562),
    S('Vila Formosa', -23.559, -46.557), S('Santa Isabel', -23.551, -46.552), S('Guilherme Giorgi', -23.545, -46.548),
    S('Aricanduva', -23.539, -46.545), R('penha'),
  ],
  // 4-Amarela: Vila Sônia -> Taboão da Serra
  '4': [S('Chácara do Jockey', -23.601, -46.745), S('Taboão da Serra', -23.61, -46.76, 1)],
}

// Trens intercidades (toggle próprio). Cidades distantes ficam fora do viewBox.
const INTERCITY = [
  {
    id: 'tic-norte', number: 'N', name: 'TIC Norte', fullName: 'TIC Norte (SP–Campinas)',
    color: '#1f6f3c', status: 'construcao',
    stops: [R('palmeiras-barra-funda'), R('jundiai'), S('Campinas', -22.905, -47.066, 1)],
  },
  {
    id: 'tim', number: 'M', name: 'TIM', fullName: 'Trem Intermetropolitano (Jundiaí–Campinas)',
    color: '#4a9e6b', status: 'construcao',
    stops: [R('jundiai'), S('Louveira', -23.087, -46.901), S('Vinhedo', -23.03, -46.975), S('Valinhos', -22.97, -46.996), S('Campinas', -22.905, -47.066, 1)],
  },
  {
    id: 'tic-oeste', number: 'O', name: 'TIC Oeste', fullName: 'TIC Oeste (SP–Sorocaba)',
    color: '#8a5fb0', status: 'elaboracao',
    stops: [R('palmeiras-barra-funda'), R('carapicuiba'), R('amador-bueno'), S('São Roque', -23.529, -47.135), S('Sorocaba', -23.502, -47.458, 1)],
  },
]

// bloco (phase) e previsão (eta) por linha definida à mão / expansão
const LINE_PHASE = {
  '6': { phase: 'construcao', eta: '2026–2027' },
  '17': { phase: 'estudo' },
  '16': { phase: 'estudo' },
  '19': { phase: 'estudo' },
  '20': { phase: 'estudo' },
  '22': { phase: 'estudo' },
}
const EXT_PHASE = {
  '2': { phase: 'construcao', eta: '2025–2028' },
  '4': { phase: 'construcao', eta: '2028' },
}

const slug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const round = (n) => Math.round(n * 1e5) / 1e5
const round1 = (n) => Math.round(n * 10) / 10
function dist(a, b) {
  const R = 6371000, toR = (x) => (x * Math.PI) / 180
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const stations = new Map()
for (const s of net.stations) stations.set(s.id, { ...s, lineIds: new Set(s.lineIds) })
const handList = [...stations.values()].filter((s) => s.schematic)

const THRESH = 300
function resolveId(name, lat, lng) {
  const id = slug(name)
  if (stations.has(id)) return id
  let best = null, bd = THRESH
  for (const h of handList) { const d = dist({ lat, lng }, h.geo); if (d < bd) { bd = d; best = h.id } }
  return best || id
}

const orderByLine = new Map()
const intercityIds = new Set()

// adiciona um stop (ref ou novo) a uma linha; retorna o id
function addStop(stop, lineId, opts = {}) {
  if (stop.ref) {
    if (stations.has(stop.ref)) stations.get(stop.ref).lineIds.add(lineId)
    return stop.ref
  }
  const prefix = opts.prefix ?? `l${lineId}-`
  const id = prefix + slug(stop.name)
  const phase = stop.op ? 'operando' : stop.phase ?? opts.phase ?? 'operando'
  if (!stations.has(id)) {
    stations.set(id, {
      id, name: stop.name, lineIds: new Set([lineId]), interchange: false,
      geo: { lat: stop.lat, lng: stop.lng }, labelTier: stop.tier ?? 3,
      phase,
      eta: phase === 'construcao' ? opts.eta : undefined,
    })
  } else {
    const st = stations.get(id)
    st.lineIds.add(lineId)
    // promove para o bloco mais "avançado" (operando > construção > estudo)
    const rank = { operando: 0, construcao: 1, estudo: 2, especulacao: 3 }
    if (rank[phase] < rank[st.phase ?? 'operando']) { st.phase = phase; if (phase === 'construcao') st.eta = opts.eta }
  }
  if (opts.intercity) intercityIds.add(id)
  return id
}

// OSM (operacionais)
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
    if (stations.has(id)) { const st = stations.get(id); st.geo = { lat: round(stop.lat), lng: round(stop.lng) }; st.lineIds.add(ref) }
    else stations.set(id, { id, name: stop.name, lineIds: new Set([ref]), interchange: false, geo: { lat: round(stop.lat), lng: round(stop.lng) }, labelTier: 3 })
  }
  orderByLine.set(ref, order)
}

// MANUAL
for (const [ref, stops] of Object.entries(MANUAL)) {
  const p = LINE_PHASE[ref] ?? {}
  orderByLine.set(ref, stops.map((s) => addStop(s, ref, p)))
}

// EXTENSIONS (anexa ao fim de stationOrder e geoOrder da linha)
const extById = {}
for (const [ref, stops] of Object.entries(EXTENSIONS)) {
  const p = EXT_PHASE[ref] ?? {}
  extById[ref] = stops.map((s) => addStop(s, ref, p))
}

// INTERCITY (linhas novas)
const intercityLines = INTERCITY.map((l) => {
  const order = l.stops.map((s) => addStop(s, l.id, { intercity: true, phase: 'operando' }))
  return {
    id: l.id, number: l.number, name: l.name, fullName: l.fullName, color: l.color,
    operator: 'outro', kind: 'trem', status: l.status, drawn: true, intercity: true,
    newsQuery: l.fullName, stationOrder: order, geoOrder: order, updates: [
      { date: '2026-04-01', text: l.fullName + ' — trem intercidades em planejamento/contratação. Traçado e estações aproximados.' },
    ],
  }
})

// demais linhas não-OSM: agrega lineIds
for (const line of net.lines) {
  if (orderByLine.has(line.id)) continue
  for (const id of line.stationOrder) if (stations.has(id)) stations.get(id).lineIds.add(line.id)
}

// terminais
const terminals = new Set()
const allOrders = [...orderByLine.values(), ...net.lines.map((l) => l.stationOrder), ...Object.values(extById), ...intercityLines.map((l) => l.stationOrder)]
for (const o of allOrders) if (o.length) { terminals.add(o[0]); terminals.add(o[o.length - 1]) }
for (const st of stations.values()) {
  st.interchange = st.interchange || st.lineIds.size > 1
  if (!st.schematic) st.labelTier = st.interchange ? 1 : terminals.has(st.id) ? 1 : st.labelTier || 3
}

// linhas (com geoOrder; aplica expansões; junta intercidades)
const lines = [
  ...net.lines.map((line) => {
    const ext = extById[line.id] ?? []
    const osmOrder = orderByLine.get(line.id)
    if (osmOrder && !TARGET.has(line.id)) {
      // MANUAL: stationOrder = geoOrder = order
      return { ...line, drawn: true, stationOrder: [...osmOrder, ...ext], geoOrder: [...osmOrder, ...ext] }
    }
    if (osmOrder) {
      // OSM: esquemático curado + geográfico completo (+ extensões nos dois)
      return { ...line, stationOrder: [...line.stationOrder, ...ext], geoOrder: [...osmOrder, ...ext] }
    }
    return { ...line, stationOrder: [...line.stationOrder, ...ext], geoOrder: [...line.stationOrder, ...ext] }
  }),
  ...intercityLines,
]

// ---- posições esquemáticas ----
const needSchem = new Set(lines.flatMap((l) => l.stationOrder))

// 1) interpola entre âncoras (com schematic) ao longo da linha
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
      const seg = []; let total = 0
      for (let k = 1; k < seq.length; k++) { const d = dist(seq[k - 1].geo, seq[k].geo) || 1; seg.push(d); total += d }
      let acc = 0
      for (let k = 0; k < j - i; k++) {
        acc += seg[k]; const f = acc / total; const st = stations.get(order[i + k])
        st.schematic = { x: round1(prev.schematic.x + (next.schematic.x - prev.schematic.x) * f), y: round1(prev.schematic.y + (next.schematic.y - prev.schematic.y) * f) }
      }
    }
    i = j
  }
}

// 2) re-base afim na âncora mais próxima da linha
const cp = handList.map((s) => ({ lng: s.geo.lng, lat: s.geo.lat, x: s.schematic.x, y: s.schematic.y }))
const fitX = fit(cp, 'x'), fitY = fit(cp, 'y')
const Lx = (dLng, dLat) => fitX[0] * dLng + fitX[1] * dLat
const Ly = (dLng, dLat) => fitY[0] * dLng + fitY[1] * dLat
for (const line of lines) {
  const order = line.stationOrder
  const anchors = order.map((id, k) => (stations.get(id).schematic ? k : -1)).filter((k) => k >= 0)
  if (!anchors.length) continue
  for (let i = 0; i < order.length; i++) {
    const st = stations.get(order[i]); if (st.schematic) continue
    let ak = anchors[0]; for (const k of anchors) if (Math.abs(k - i) < Math.abs(ak - i)) ak = k
    const a = stations.get(order[ak])
    st.schematic = { x: round1(a.schematic.x + Lx(st.geo.lng - a.geo.lng, st.geo.lat - a.geo.lat)), y: round1(a.schematic.y + Ly(st.geo.lng - a.geo.lng, st.geo.lat - a.geo.lat)) }
  }
}
for (const st of stations.values()) {
  if (st.schematic || !needSchem.has(st.id)) continue
  st.schematic = { x: round1(fitX[0] * st.geo.lng + fitX[1] * st.geo.lat + fitX[2]), y: round1(fitY[0] * st.geo.lng + fitY[1] * st.geo.lat + fitY[2]) }
}

// viewBox esquemático: ignora intercidades (cidades distantes)
let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9
for (const st of stations.values()) {
  if (!st.schematic || intercityIds.has(st.id)) continue
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
  const out = { id: s.id, name: s.name, lineIds: [...s.lineIds].sort((a, b) => a.localeCompare(b)), interchange: s.interchange }
  if (s.schematic) out.schematic = s.schematic
  out.geo = s.geo
  out.labelTier = s.labelTier
  if (s.phase && s.phase !== 'operando') out.phase = s.phase
  if (s.eta) out.eta = s.eta
  if (s.labelAnchor) out.labelAnchor = s.labelAnchor
  if (s.labelOffset) out.labelOffset = s.labelOffset
  return out
})

writeFileSync('src/data/network.json', JSON.stringify({ version: '0.4.0', updatedAt: net.updatedAt, viewBox, lines, stations: stationsOut }, null, 2) + '\n')

const byPhase = (p) => stationsOut.filter((s) => (s.phase ?? 'operando') === p).length
console.log('Estações:', stationsOut.length, '| operando:', byPhase('operando'), 'construção:', byPhase('construcao'), 'estudo:', byPhase('estudo'))
console.log('Linhas:', lines.length, '| intercidades:', intercityLines.length, '| viewBox', viewBox.width + 'x' + viewBox.height)

function fit(points, key) {
  let Sll = 0, Sla = 0, Sl = 0, Saa = 0, Sa = 0, N = points.length, Svl = 0, Sva = 0, Sv = 0
  for (const p of points) { const l = p.lng, a = p.lat, v = p[key]; Sll += l * l; Sla += l * a; Sl += l; Saa += a * a; Sa += a; Svl += v * l; Sva += v * a; Sv += v }
  return solve3([[Sll, Sla, Sl], [Sla, Saa, Sa], [Sl, Sa, N]], [Svl, Sva, Sv])
}
function solve3(A, b) {
  const m = [[...A[0], b[0]], [...A[1], b[1]], [...A[2], b[2]]]
  for (let i = 0; i < 3; i++) {
    let piv = i; for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[piv][i])) piv = r
    ;[m[i], m[piv]] = [m[piv], m[i]]
    const d = m[i][i]; for (let c = i; c < 4; c++) m[i][c] /= d
    for (let r = 0; r < 3; r++) if (r !== i) { const f = m[r][i]; for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c] }
  }
  return [m[0][3], m[1][3], m[2][3]]
}
