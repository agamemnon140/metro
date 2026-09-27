import { Map, Route, TrainFront } from 'lucide-react'
import { NetworkMap } from './components/map/NetworkMap'
import { Legend } from './components/Legend'
import { DisplayMenu } from './components/DisplayMenu'
import { InstallPrompt } from './components/InstallPrompt'
import { StationPanel } from './components/panels/StationPanel'
import { LinePanel } from './components/panels/LinePanel'
import { useSelection } from './hooks/useSelection'
import { useViewMode } from './hooks/useViewMode'
import { getStation, getLine } from './lib/network'

export default function App() {
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const setMode = useViewMode((s) => s.set)

  const station =
    selection?.kind === 'station' ? getStation(selection.id) : undefined
  const line = selection?.kind === 'line' ? getLine(selection.id) : undefined

  return (
    <div className="h-full flex flex-col bg-[var(--map-surface)]">
      <header className="relative shrink-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-3 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center gap-3 flex-wrap sm:px-5">
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0455a1] text-white">
            <TrainFront size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold leading-tight">Metro <span className="font-normal text-gray-500 dark:text-gray-400">São Paulo</span></h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Explore a rede de metrô e trens</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
          <div role="group" aria-label="Visualização do mapa" className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            {([
              ['schematic', 'Diagrama', Route],
              ['geographic', 'Geográfico', Map],
            ] as const).map(([value, label, Icon]) => (
              <button key={value} onClick={() => setMode(value)} aria-pressed={mode === value}
                className={'flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition sm:px-3 sm:text-sm ' +
                  (mode === value ? 'bg-white dark:bg-gray-700 text-[#0455a1] dark:text-blue-200 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60')}>
                <Icon size={16} className="hidden min-[360px]:block" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <DisplayMenu />
        </div>
      </header>

      <main className="flex-1 min-h-0 relative overflow-hidden touch-none">
        <NetworkMap />
        <Legend />
        <InstallPrompt />
        {station && <StationPanel station={station} />}
        {line && <LinePanel line={line} />}
      </main>
    </div>
  )
}
