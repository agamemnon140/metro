// Busca relações de rota (metrô/trem/monotrilho) da Grande São Paulo na
// Overpass API (OpenStreetMap) e resume estações ordenadas + coordenadas.
// Uso: node scripts/fetch-osm.mjs > scratch/osm.json

const QUERY = `
[out:json][timeout:120];
(
  relation["type"="route"]["route"="subway"](-24.2,-47.3,-22.9,-45.8);
  relation["type"="route"]["route"="train"](-24.2,-47.3,-22.9,-45.8);
  relation["type"="route"]["route"="monorail"](-24.2,-47.3,-22.9,-45.8);
  relation["type"="route"]["route"="light_rail"](-24.2,-47.3,-22.9,-45.8);
);
out body;
>;
out body qt;
`

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function run() {
  let data
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'metro-sp-app/0.1 (educational project)',
        },
        body: 'data=' + encodeURIComponent(QUERY),
      })
      if (!res.ok) { console.error('HTTP', res.status, url); continue }
      data = await res.json()
      break
    } catch (e) { console.error('falhou', url, e.message) }
  }
  if (!data) { console.error('sem dados'); process.exit(1) }

  const nodes = new Map()
  for (const el of data.elements) {
    if (el.type === 'node') nodes.set(el.id, el)
  }

  const lines = []
  for (const el of data.elements) {
    if (el.type !== 'relation') continue
    const t = el.tags || {}
    const stops = []
    for (const m of el.members || []) {
      if (m.type !== 'node') continue
      if (!/stop|station|halt/.test(m.role || '')) continue
      const n = nodes.get(m.ref)
      if (!n) continue
      const name = n.tags?.name
      if (!name) continue
      stops.push({ name, lat: n.lat, lng: n.lon })
    }
    if (stops.length < 2) continue
    lines.push({
      ref: t.ref || '',
      name: t.name || '',
      route: t.route,
      colour: t.colour || '',
      operator: t.operator || '',
      network: t.network || '',
      from: t.from || '',
      to: t.to || '',
      count: stops.length,
      stops,
    })
  }

  // resumo para inspeção
  console.error('=== RELACOES ENCONTRADAS ===')
  for (const l of lines.sort((a, b) => (a.ref + a.name).localeCompare(b.ref + b.name))) {
    console.error(
      `ref=${l.ref.padEnd(4)} stops=${String(l.count).padStart(3)} | ${l.route.padEnd(8)} | ${l.name}`,
    )
  }
  console.log(JSON.stringify(lines, null, 2))
}

run()
