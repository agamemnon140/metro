import { create } from 'zustand'

export type Layer = 'construction' | 'study' | 'speculation' | 'intercity'

export interface LayersState {
  construction: boolean
  study: boolean
  speculation: boolean
  intercity: boolean
  toggle: (layer: Layer) => void
}

// Camadas além das linhas em operação (sempre visíveis): em construção,
// em estudo, especulação e trens intercidades. Todas começam ocultas.
export const useLayers = create<LayersState>((set) => ({
  construction: false,
  study: false,
  speculation: false,
  intercity: false,
  toggle: (layer) => set((s) => ({ ...s, [layer]: !s[layer] })),
}))
