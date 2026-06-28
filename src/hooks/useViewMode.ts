import { create } from 'zustand'
import type { ViewMode } from '@/lib/coords'

interface ViewModeState {
  mode: ViewMode
  toggle: () => void
  set: (mode: ViewMode) => void
}

export const useViewMode = create<ViewModeState>((set) => ({
  mode: 'geographic',
  toggle: () =>
    set((s) => ({ mode: s.mode === 'schematic' ? 'geographic' : 'schematic' })),
  set: (mode) => set({ mode }),
}))
