import { NetworkMap } from './components/map/NetworkMap'
import { Legend } from './components/Legend'
import { InstallPrompt } from './components/InstallPrompt'
import { StationPanel } from './components/panels/StationPanel'
import { LinePanel } from './components/panels/LinePanel'
import { useSelection } from './hooks/useSelection'
import { useViewMode } from './hooks/useViewMode'
import { useShowFuture } from './hooks/useShowFuture'
import { getStation, getLine } from './lib/network'

export default function App() {
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const toggleMode = useViewMode((s) => s.toggle)
  const showFuture = useShowFuture((s) => s.show)
  const toggleFuture = useShowFuture((s) => s.toggle)

  const station =
    selection?.kind === 'station' ? getStation(selection.id) : undefined
  const line = selection?.kind === 'line' ? getLine(selection.id) : undefined

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="shrink-0 bg-[#0455a1] text-white px-4 py-2.5 shadow-md z-10 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold leading-tight">
            Rede Metroferroviária de São Paulo
          </h1>
          <p className="text-[11px] text-blue-100 truncate">
            Toque numa estação para abrir no mapa · numa linha para ver status e notícias
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={toggleFuture}
            className={
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition ' +
              (showFuture ? 'bg-white text-[#0455a1]' : 'bg-white/15 hover:bg-white/25')
            }
            title="Mostrar/ocultar linhas em projeto e estudo"
            aria-pressed={showFuture}
          >
            {showFuture ? '✓ Projetos' : 'Projetos'}
          </button>
          <button
            onClick={toggleMode}
            className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold transition"
            title="Alternar entre diagrama esquemático e mapa geográfico"
            aria-label="Alternar visão do mapa"
          >
            {mode === 'schematic' ? '🗺️ Geográfico' : '📐 Esquemático'}
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
