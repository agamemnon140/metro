import { create } from 'zustand'

// hubs = só baldeações (padrão, limpo) · todos = todas (anti-colisão) · off
export type LabelMode = 'hubs' | 'todos' | 'off'

const NEXT: Record<LabelMode, LabelMode> = {
  hubs: 'todos',
  todos: 'off',
  off: 'hubs',
}

interface LabelModeState {
  mode: LabelMode
  cycle: () => void
}

export const useLabelMode = create<LabelModeState>((set) => ({
  mode: 'hubs',
  cycle: () => set((s) => ({ mode: NEXT[s.mode] })),
}))
