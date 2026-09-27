import type { Line, Station } from '@/types/network'
import type { Layers } from './network'
import { isPhaseVisible } from './network'

export type TrackStyle = 'operating' | 'construction' | 'project'

export const TRACK_STYLES: Record<TrackStyle, { label: string; dash?: string }> = {
  operating: { label: 'Em operação' },
  construction: { label: 'Em obras', dash: '12 10' },
  project: { label: 'Projeto / proposta', dash: '1 10' },
}

const rank: Record<TrackStyle, number> = { operating: 0, construction: 1, project: 2 }

function stationStyle(station: Station): TrackStyle {
  if (station.phase === 'construcao') return 'construction'
  if (station.phase === 'estudo' || station.phase === 'especulacao') return 'project'
  return 'operating'
}

/** Split at phase changes, keeping the boundary station in both adjoining runs. */
export function lineSegments(line: Line, stations: Station[], layers: Layers) {
  const baseline: TrackStyle = line.status === 'construcao' ? 'construction'
    : ['contratacao', 'elaboracao', 'estudo'].includes(line.status) ? 'project' : 'operating'

  // Intercity services have their own visibility toggle. Shared operating
  // stations must not reveal a future urban line while its layer is hidden.
  if (line.intercity ? !layers.intercity :
    baseline === 'construction' ? !layers.construction :
    baseline === 'project' ? !layers.study && !layers.speculation : false) return []

  const runs: { style: TrackStyle; stations: Station[] }[] = []
  let current: (typeof runs)[number] | undefined
  for (let i = 1; i < stations.length; i++) {
    const a = stations[i - 1]
    const b = stations[i]
    if (!isPhaseVisible(a, layers) || !isPhaseVisible(b, layers)) {
      current = undefined
      continue
    }
    const style = [baseline, stationStyle(a), stationStyle(b)]
      .reduce((result, candidate) => rank[candidate] > rank[result] ? candidate : result)
    if (current?.style === style) current.stations.push(b)
    else {
      current = { style, stations: [a, b] }
      runs.push(current)
    }
  }
  return runs
}
