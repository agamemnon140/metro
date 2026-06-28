import { create } from 'zustand'

interface ZoomState {
  scale: number
  setScale: (scale: number) => void
}

export const useZoom = create<ZoomState>((set) => ({
  scale: 1,
  setScale: (scale) => set({ scale }),
}))

/**
 * Nível de detalhe de rótulos atual em função da escala.
 * Uma estação com labelTier T fica visível quando tierForScale >= T.
 */
export function tierForScale(scale: number): 1 | 2 | 3 {
  if (scale < 1.4) return 1
  if (scale < 2.5) return 2
  return 3
}
