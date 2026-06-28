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

/** Linhas com geometria desenhada no diagrama (MVP). */
export function drawnLines(): Line[] {
  return network.lines.filter((l) => l.drawn)
}

/** Estações que aparecem em alguma linha desenhada. */
export function drawnStations(): Station[] {
  const drawnIds = new Set(drawnLines().flatMap((l) => l.stationOrder))
  return network.stations.filter((s) => drawnIds.has(s.id))
}

/** Linhas que servem uma estação, na ordem do dataset. */
export function linesForStation(station: Station): Line[] {
  return station.lineIds
    .map((id) => lineById.get(id))
    .filter((l): l is Line => Boolean(l))
}

/** Estações de uma linha, na ordem do traçado. */
export function stationsForLine(line: Line): Station[] {
  return line.stationOrder
    .map((id) => stationById.get(id))
    .filter((s): s is Station => Boolean(s))
}
