import { create } from 'zustand'

interface ShowFutureState {
  show: boolean
  toggle: () => void
}

// Controla a exibição das linhas em projeto/estudo (traçado indicativo).
export const useShowFuture = create<ShowFutureState>((set) => ({
  show: false,
  toggle: () => set((s) => ({ show: !s.show })),
}))
