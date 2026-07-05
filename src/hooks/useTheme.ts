import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

const THEME_COLOR: Record<Theme, string> = {
  light: '#0455a1',
  dark: '#0b0e14',
}

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme])
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggle: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'metro:theme' },
  ),
)

// aplica no load (cobre o estado persistido) e a cada mudança;
// o snippet inline no index.html evita o flash antes do JS carregar
applyTheme(useTheme.getState().theme)
useTheme.subscribe((s) => applyTheme(s.theme))
