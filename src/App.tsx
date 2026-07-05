import { Type, Map, Route, Sun, Moon } from 'lucide-react'
import { NetworkMap } from './components/map/NetworkMap'
import { Legend } from './components/Legend'
import { LayersMenu } from './components/LayersMenu'
import { InstallPrompt } from './components/InstallPrompt'
import { StationPanel } from './components/panels/StationPanel'
import { LinePanel } from './components/panels/LinePanel'
import { useSelection } from './hooks/useSelection'
import { useViewMode } from './hooks/useViewMode'
import { useLabelMode } from './hooks/useLabelMode'
import { useTheme } from './hooks/useTheme'
import { getStation, getLine } from './lib/network'

const LABEL_BTN: Record<string, string> = {
  hubs: 'hubs',
  todos: 'todos',
  off: 'off',
}

export default function App() {
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const toggleMode = useViewMode((s) => s.toggle)
  const labelMode = useLabelMode((s) => s.mode)
  const cycleLabels = useLabelMode((s) => s.cycle)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)

  const station =
    selection?.kind === 'station' ? getStation(selection.id) : undefined
  const line = selection?.kind === 'line' ? getLine(selection.id) : undefined

  const chip = (active: boolean) =>
    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ' +
    (active ? 'bg-white text-[#0455a1]' : 'bg-white/15 hover:bg-white/25')

  return (
    <div className="h-full flex flex-col bg-[var(--map-surface)]">
      <header className="shrink-0 bg-[#0455a1] dark:bg-[#0a1f36] text-white px-3 py-2 shadow-md z-10 flex items-center gap-x-3 gap-y-1.5 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <h1 className="text-sm font-bold leading-tight">
            Rede Metroferroviária de São Paulo
          </h1>
          <p className="text-[10px] text-blue-100 truncate">
            Estação → mapa · Linha → status e notícias
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 justify-end">
          <button
            onClick={cycleLabels}
            className={chip(labelMode !== 'off')}
            title="Nomes das estações: só hubs / todos / nenhum"
          >
            <Type size={14} />
            <span className="hidden sm:inline">{LABEL_BTN[labelMode]}</span>
          </button>
          <LayersMenu />
          <button
            onClick={toggleMode}
            className={chip(false)}
            title="Alternar diagrama esquemático / mapa geográfico"
          >
            {mode === 'schematic' ? <Map size={14} /> : <Route size={14} />}
            <span className="hidden sm:inline">
              {mode === 'schematic' ? 'Geo' : 'Esq'}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className={chip(false)}
            title="Alternar tema claro/escuro"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden touch-none">
        <NetworkMap />
        <Legend />
        <InstallPrompt />
        {station && <StationPanel station={station} />}
        {line && <LinePanel line={line} />}
      </main>
    </div>
  )
}
