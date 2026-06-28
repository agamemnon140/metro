import type { SchematicPoint, Station } from '@/types/network'
import { network } from '@/lib/network'

// Costura que decide entre o diagrama esquemático e a visão geográfica.
// O esquemático usa as posições x/y do dataset; o geográfico projeta lat/lng
// (equiretangular com correção de cosseno da latitude) para o mesmo espaço de
// canvas, mantendo escalas de traço/estação comparáveis.

export type ViewMode = 'schematic' | 'geographic'

const TARGET_W = 1400
const PAD = 70

const geos = network.stations.map((s) => s.geo)
const lats = geos.map((g) => g.lat)
const lngs = geos.map((g) => g.lng)
const latMin = Math.min(...lats)
const latMax = Math.max(...lats)
const lngMin = Math.min(...lngs)
const lngMax = Math.max(...lngs)
const cosLat = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180)
const xSpan = (lngMax - lngMin) * cosLat || 1
const k = (TARGET_W - 2 * PAD) / xSpan
const geoHeight = Math.round((latMax - latMin) * k + 2 * PAD)

export const schematicViewBox = network.viewBox
export const geoViewBox = { width: TARGET_W, height: geoHeight }

function geoToPoint(lat: number, lng: number): SchematicPoint {
  return {
    x: PAD + (lng - lngMin) * cosLat * k,
    y: PAD + (latMax - lat) * k,
  }
}

export function pointFor(station: Station, mode: ViewMode = 'schematic'): SchematicPoint {
  if (mode === 'geographic') return geoToPoint(station.geo.lat, station.geo.lng)
  // estação sem posição esquemática cai na projeção geográfica (segurança)
  return station.schematic ?? geoToPoint(station.geo.lat, station.geo.lng)
}

export function viewBoxFor(mode: ViewMode) {
  return mode === 'geographic' ? geoViewBox : schematicViewBox
}
