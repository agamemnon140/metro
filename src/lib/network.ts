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

type Mode = 'schematic' | 'geographic'

function orderFor(line: Line, mode: Mode): string[] {
  return mode === 'geographic' ? line.geoOrder ?? line.stationOrder : line.stationOrder
}

/** Estações que aparecem em alguma linha desenhada, conforme o modo. */
export function drawnStations(mode: Mode = 'schematic'): Station[] {
  const drawnIds = new Set(drawnLines().flatMap((l) => orderFor(l, mode)))
  return network.stations.filter((s) => drawnIds.has(s.id))
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
