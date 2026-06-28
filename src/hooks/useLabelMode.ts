import { create } from 'zustand'

export type LabelMode = 'normal' | 'small' | 'off'

const NEXT: Record<LabelMode, LabelMode> = {
  normal: 'small',
  small: 'off',
  off: 'normal',
}

interface LabelModeState {
  mode: LabelMode
  cycle: () => void
}

// Controla os nomes das estações: normal -> pequeno -> oculto.
export const useLabelMode = create<LabelModeState>((set) => ({
  mode: 'normal',
  cycle: () => set((s) => ({ mode: NEXT[s.mode] })),
}))
