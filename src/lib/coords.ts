import type { SchematicPoint, Station } from '@/types/network'

// Única costura que decide entre o diagrama esquemático e uma futura visão
// geográfica. Hoje retorna sempre a posição esquemática; quando a visão
// geográfica for adicionada, basta projetar `station.geo` aqui.

export type ViewMode = 'schematic' | 'geographic'

export function pointFor(station: Station, mode: ViewMode = 'schematic'): SchematicPoint {
  if (mode === 'geographic') {
    // Placeholder para evolução futura: projeção de lat/lng -> x/y.
    // Por ora caímos no esquemático para não quebrar a renderização.
    return station.schematic
  }
  return station.schematic
}
