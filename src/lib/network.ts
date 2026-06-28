import rawData from '@/data/network.json'
import type { Line, NetworkData, Station } from '@/types/network'

export const network = rawData as NetworkData

const stationById = new Map<string, Station>(
  network.stations.map((s) => [s.id, s]),
)
const lineById = new Map<string, Line>(network.lines.map((l) => [l.id, l]))

export function getStation(id: string): Station | undefined {
  return stationById.get(id)
}

export function getLine(id: string): Line | undefined {
  return lineById.get(id)
}

export interface Layers {
  construction: boolean
  study: boolean
  speculation: boolean
  intercity: boolean
}

/** Uma estação é visível segundo seu bloco e as camadas ligadas. */
export function isPhaseVisible(s: Station, layers: Layers): boolean {
  switch (s.phase ?? 'operando') {
    case 'construcao':
      return layers.construction
    case 'estudo':
      return layers.study
    case 'especulacao':
      return layers.speculation
    default:
      return true
  }
}

/** Linhas desenhadas. Intercidades só com a camada `intercity`. */
export function drawnLines(layers: Layers): Line[] {
  return network.lines.filter((l) => l.drawn && (l.intercity ? layers.intercity : true))
}

type Mode = 'schematic' | 'geographic'

function orderFor(line: Line, mode: Mode): string[] {
  return mode === 'geographic' ? line.geoOrder ?? line.stationOrder : line.stationOrder
}

/** Estações visíveis conforme o modo e as camadas. */
export function drawnStations(mode: Mode, layers: Layers): Station[] {
  const drawnIds = new Set(drawnLines(layers).flatMap((l) => orderFor(l, mode)))
  return network.stations.filter(
    (s) => drawnIds.has(s.id) && isPhaseVisible(s, layers),
  )
}

/** Linhas que servem uma estação, na ordem do dataset. */
export function linesForStation(station: Station): Line[] {
  return station.lineIds
    .map((id) => lineById.get(id))
    .filter((l): l is Line => Boolean(l))
}

/** Estações de uma linha, na ordem do traçado (esquemático ou geográfico). */
export function stationsForLine(line: Line, mode: Mode = 'schematic'): Station[] {
  return orderFor(line, mode)
    .map((id) => stationById.get(id))
    .filter((s): s is Station => Boolean(s))
}
