import { NetworkMap } from './components/map/NetworkMap'
import { Legend } from './components/Legend'
import { InstallPrompt } from './components/InstallPrompt'
import { StationPanel } from './components/panels/StationPanel'
import { LinePanel } from './components/panels/LinePanel'
import { useSelection } from './hooks/useSelection'
import { getStation, getLine } from './lib/network'

export default function App() {
  const selection = useSelection((s) => s.selection)

  const station =
    selection?.kind === 'station' ? getStation(selection.id) : undefined
  const line = selection?.kind === 'line' ? getLine(selection.id) : undefined

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="shrink-0 bg-[#0455a1] text-white px-4 py-2.5 shadow-md z-10">
        <h1 className="text-base font-bold leading-tight">
          Rede Metroferroviária de São Paulo
        </h1>
        <p className="text-[11px] text-blue-100">
          Toque numa estação para abrir no mapa · numa linha para ver status e notícias
        </p>
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
