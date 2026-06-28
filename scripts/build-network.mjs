// Mescla o dataset curado (src/data/network.json) com os dados do OSM
// (scratch/osm.json): mantém o diagrama esquemático e adiciona a camada
// geográfica completa (geoOrder + estações novas só com geo).
//
// Uso: node scripts/build-network.mjs   (escreve src/data/network.json)

import { readFileSync, writeFileSync } from 'node:fs'

const osm = JSON.parse(readFileSync('scratch/osm.json', 'utf8'))
const net = JSON.parse(readFileSync('src/data/network.json', 'utf8'))

// refs do OSM -> id da linha no nosso dataset (mesmo número)
const TARGET = new Set(['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '15', '17'])

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// melhor variante por ref (mais paradas)
const bestByRef = new Map()
for (const rel of osm) {
  if (!TARGET.has(rel.ref)) continue
  const cur = bestByRef.get(rel.ref)
  if (!cur || rel.count > cur.count) bestByRef.set(rel.ref, rel)
}

// índice das estações curadas existentes (por id)
const existing = new Map(net.stations.map((s) => [s.id, s]))

// monta o conjunto final de estações
const stations = new Map() // id -> station

// 1) começa com TODAS as estações existentes (preserva schematic/labels)
for (const s of net.stations) {
  stations.set(s.id, { ...s, lineIds: new Set(s.lineIds) })
}

// 2) aplica OSM: geoOrder por linha + estações novas + geo atualizado
const geoOrderByLine = new Map()
for (const [ref, rel] of bestByRef) {
  const order = []
  let prev = null
  for (const stop of rel.stops) {
    const id = slug(stop.name)
    if (id === prev) continue // dedupe consecutivo
    prev = id
    order.push(id)
    if (stations.has(id)) {
      const st = stations.get(id)
      st.geo = { lat: round(stop.lat), lng: round(stop.lng) }
      st.lineIds.add(ref)
    } else {
      stations.set(id, {
        id,
        name: stop.name,
        lineIds: new Set([ref]),
        interchange: false,
        geo: { lat: round(stop.lat), lng: round(stop.lng) },
        labelTier: 3,
      })
    }
  }
  geoOrderByLine.set(ref, order)
}

// 3) garante que linhas não-OSM (6,16,19,20,22,...) tenham lineIds nas suas estações
for (const line of net.lines) {
  if (TARGET.has(line.id)) continue
  for (const id of line.stationOrder) {
    if (stations.has(id)) stations.get(id).lineIds.add(line.id)
  }
}

// 4) terminais e baldeações -> labelTier
const terminals = new Set()
for (const order of geoOrderByLine.values()) {
  if (order.length) {
    terminals.add(order[0])
    terminals.add(order[order.length - 1])
  }
}
for (const line of net.lines) {
  const o = line.stationOrder
  if (o.length) {
    terminals.add(o[0])
    terminals.add(o[o.length - 1])
  }
}
for (const st of stations.values()) {
  st.interchange = st.interchange || st.lineIds.size > 1
  // só promove tier para estações novas (sem schematic curado)
  if (!st.schematic) {
    if (st.interchange) st.labelTier = 1
    else if (terminals.has(st.id)) st.labelTier = 1
    else st.labelTier = 3
  }
}

// 5) monta linhas com geoOrder
const lines = net.lines.map((line) => {
  const geoOrder = geoOrderByLine.get(line.id)
  return geoOrder ? { ...line, geoOrder } : { ...line }
})

// 6) serializa estações (Set -> array, ordena lineIds numericamente)
const stationsOut = [...stations.values()].map((s) => {
  const lineIds = [...s.lineIds].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
  const out = { id: s.id, name: s.name, lineIds, interchange: s.interchange }
  if (s.schematic) out.schematic = s.schematic
  out.geo = s.geo
  out.labelTier = s.labelTier
  if (s.labelAnchor) out.labelAnchor = s.labelAnchor
  if (s.labelOffset) out.labelOffset = s.labelOffset
  return out
})

const result = {
  version: '0.2.0',
  updatedAt: net.updatedAt,
  viewBox: net.viewBox,
  lines,
  stations: stationsOut,
}

writeFileSync('src/data/network.json', JSON.stringify(result, null, 2) + '\n')

function round(n) {
  return Math.round(n * 1e5) / 1e5
}

// relatório
console.log('Estações totais:', stationsOut.length)
console.log('Com schematic:', stationsOut.filter((s) => s.schematic).length)
console.log('Só geo (novas):', stationsOut.filter((s) => !s.schematic).length)
for (const [ref, order] of [...geoOrderByLine].sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  linha ${ref}: geoOrder ${order.length} estações`)
}
