// Revisão documentada em docs/revisao-linha-17.md. Aplicada também pelo gerador
// para impedir que a antiga lista manual recoloque os trechos futuros em operação.
const dms = (degrees, minutes, seconds) => -(degrees + minutes / 60 + seconds / 3600)
const stop = (id, name, lat, lng, phase = 'operando') => ({ id, name, geo: { lat, lng }, phase })
const reviewedStops = [
  stop('l17-morumbi', 'Morumbi', dms(23, 37, 17.73), dms(46, 42, 6)),
  stop('l17-chucri-zaidan', 'Chucri Zaidan', dms(23, 36, 50.35), dms(46, 41, 43)),
  stop('l17-vila-cordeiro', 'Vila Cordeiro', dms(23, 36, 56), dms(46, 41, 19)),
  stop('l17-vereador-jose-diniz', 'Vereador José Diniz', dms(23, 37, 20), dms(46, 40, 43)),
  stop('l17-brooklin-paulista', 'Brooklin Paulista', dms(23, 37, 46), dms(46, 40, 25)),
  stop('l17-aeroporto-de-congonhas', 'Aeroporto de Congonhas', dms(23, 37, 37), dms(46, 39, 42.35)),
  stop('l17-washington-luis', 'Washington Luís', dms(23, 38, 5), dms(46, 40, 6)),
  // Extensões históricas: posições indicativas, nunca apresentadas como operação.
  stop('l17-estadio-morumbi', 'Estádio Morumbi', -23.595, -46.715, 'estudo'),
  stop('l17-americo-maurano', 'Américo Maurano', -23.602, -46.722, 'estudo'),
  stop('l17-paraisopolis', 'Paraisópolis', -23.608, -46.725, 'estudo'),
  stop('l17-panamby', 'Panamby', -23.615, -46.722, 'estudo'),
  stop('l17-vila-paulista', 'Vila Paulista', -23.635, -46.642, 'estudo'),
  stop('l17-vila-babilonia', 'Vila Babilônia', -23.64, -46.638, 'estudo'),
  stop('l17-cidade-leonor', 'Cidade Leonor', -23.643, -46.632, 'estudo'),
  stop('l17-hospital-saboia', 'Hospital Sabóia', -23.646, -46.628, 'estudo'),
]

export function applyReviewedGoldLine(network) {
  const gold = network.lines.find((line) => line.id === '17')
  const emerald = network.lines.find((line) => line.id === '9')
  if (!gold || !emerald) throw new Error('Revisão da Ouro requer as linhas 17 e 9')
  const byId = new Map(network.stations.map((station) => [station.id, station]))
  for (const reviewed of reviewedStops) {
    let station = byId.get(reviewed.id)
    if (!station) {
      station = { id: reviewed.id, name: reviewed.name, lineIds: ['17'], interchange: false, labelTier: 3 }
      network.stations.push(station)
      byId.set(station.id, station)
    }
    Object.assign(station, reviewed)
  }

  gold.routes = [
    { name: 'Trecho comum · Morumbi a Brooklin Paulista', phase: 'operando', stationIds: ['l17-morumbi', 'l17-chucri-zaidan', 'l17-vila-cordeiro', 'campo-belo', 'l17-vereador-jose-diniz', 'l17-brooklin-paulista'] },
    { name: 'Ramal Aeroporto de Congonhas', phase: 'operando', stationIds: ['l17-brooklin-paulista', 'l17-aeroporto-de-congonhas'] },
    { name: 'Ramal Washington Luís', phase: 'operando', stationIds: ['l17-brooklin-paulista', 'l17-washington-luis'] },
    { name: 'Extensão prevista · São Paulo–Morumbi', phase: 'estudo', stationIds: ['sao-paulo-morumbi', 'l17-estadio-morumbi', 'l17-americo-maurano', 'l17-paraisopolis', 'l17-panamby', 'l17-morumbi'] },
    { name: 'Extensão prevista · Jabaquara', phase: 'estudo', stationIds: ['l17-washington-luis', 'l17-vila-paulista', 'l17-vila-babilonia', 'l17-cidade-leonor', 'l17-hospital-saboia', 'jabaquara'] },
  ]
  gold.stationOrder = [...new Set(gold.routes.flatMap((route) => route.stationIds))]
  gold.geoOrder = [...gold.stationOrder]
  gold.serviceSummary = 'Morumbi ↔ Aeroporto de Congonhas / Washington Luís'
  gold.status = 'operacao'
  gold.updates = [{
    date: '2026-06-30',
    text: 'Oito estações em operação na primeira fase. A linha se divide em Brooklin Paulista, com destinos Aeroporto de Congonhas e Washington Luís. Integrações com a Linha 9 em Morumbi e a Linha 5 em Campo Belo. As extensões permanecem futuras.',
    sourceUrl: 'https://prefeitura.sp.gov.br/w/primeira-fase-da-linha-17-ouro-%C3%A9-conclu%C3%ADda-com-inaugura%C3%A7%C3%A3o-da-esta%C3%A7%C3%A3o-washington-lu%C3%ADs-na-zona-sul',
  }]

  const operating = new Set(gold.routes.filter((route) => route.phase === 'operando').flatMap((route) => route.stationIds))
  for (const id of gold.stationOrder) {
    const station = byId.get(id)
    if (!station) throw new Error('Estação ausente na revisão da Ouro: ' + id)
    station.lineIds = [...new Set([...station.lineIds, '17'])]
    station.linePhases = { ...station.linePhases, '17': operating.has(id) ? 'operando' : 'estudo' }
    if (station.lineIds.length > 1) station.interchange = true
  }
  const morumbi = byId.get('l17-morumbi')
  // The previous import had placed Granja Julieta at Morumbi's coordinates.
  byId.get('granja-julieta').geo = { lat: dms(23, 37, 38), lng: dms(46, 42, 42) }
  morumbi.lineIds = ['9', '17']
  morumbi.interchange = true
  morumbi.labelTier = 1
  for (const key of ['stationOrder', 'geoOrder']) {
    const order = (emerald[key] ?? emerald.stationOrder).filter((id) => id !== morumbi.id)
    const after = order.indexOf('berrini')
    if (after < 0) throw new Error('Berrini ausente na Linha 9')
    order.splice(after + 1, 0, morumbi.id)
    emerald[key] = order
  }

  // Preserve the diagram's coordinate system by placing the shared node on L9.
  const a = byId.get('berrini').schematic
  const b = byId.get('granja-julieta').schematic
  const campo = byId.get('campo-belo').schematic
  morumbi.schematic = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  for (const [index, id] of ['l17-chucri-zaidan', 'l17-vila-cordeiro'].entries()) {
    const t = (index + 1) / 3
    byId.get(id).schematic = { x: morumbi.schematic.x + (campo.x - morumbi.schematic.x) * t, y: morumbi.schematic.y + (campo.y - morumbi.schematic.y) * t }
  }
  for (const [id, dx, dy] of [
    ['l17-vereador-jose-diniz', 45, 35], ['l17-brooklin-paulista', 90, 70],
    ['l17-aeroporto-de-congonhas', 170, 45], ['l17-washington-luis', 130, 125],
  ]) byId.get(id).schematic = { x: campo.x + dx, y: campo.y + dy }
  for (const id of ['l17-aeroporto-de-congonhas', 'l17-washington-luis', 'l17-brooklin-paulista']) byId.get(id).labelTier = 1

  // Retain approximate future alignments, with explicit phase at shared endpoints.
  for (const route of gold.routes.filter((route) => route.phase === 'estudo')) {
    const start = byId.get(route.stationIds[0]).schematic
    const end = byId.get(route.stationIds.at(-1)).schematic
    route.stationIds.slice(1, -1).forEach((id, index) => {
      const t = (index + 1) / (route.stationIds.length - 1)
      byId.get(id).schematic = { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t }
    })
  }
  const currentIds = new Set(gold.stationOrder)
  network.stations = network.stations.filter((station) => {
    if (!station.lineIds.includes('17') || currentIds.has(station.id)) return true
    station.lineIds = station.lineIds.filter((id) => id !== '17')
    return station.lineIds.length > 0
  })
  return network
}
