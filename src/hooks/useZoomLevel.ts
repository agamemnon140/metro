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
 * Nível de detalhe de rótulos em função da escala e do modo.
 * Uma estação com labelTier T fica visível quando tierForScale >= T.
 * O modo geográfico é mais denso, então exige mais zoom para revelar rótulos.
 */
export function tierForScale(
  scale: number,
  mode: 'schematic' | 'geographic' = 'schematic',
): 1 | 2 | 3 {
  if (mode === 'geographic') {
    if (scale < 2.2) return 1
    if (scale < 3.6) return 2
    return 3
  }
  if (scale < 1.4) return 1
  if (scale < 2.5) return 2
  return 3
}
