import { create } from 'zustand'

export type Selection =
  | { kind: 'station'; id: string }
  | { kind: 'line'; id: string }
  | null

interface SelectionState {
  selection: Selection
  selectStation: (id: string) => void
  selectLine: (id: string) => void
  clear: () => void
}

export const useSelection = create<SelectionState>((set) => ({
  selection: null,
  selectStation: (id) => set({ selection: { kind: 'station', id } }),
  selectLine: (id) => set({ selection: { kind: 'line', id } }),
  clear: () => set({ selection: null }),
}))
