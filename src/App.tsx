import { NetworkMap } from './components/map/NetworkMap'
import { Legend } from './components/Legend'
import { InstallPrompt } from './components/InstallPrompt'
import { StationPanel } from './components/panels/StationPanel'
import { LinePanel } from './components/panels/LinePanel'
import { useSelection } from './hooks/useSelection'
import { useViewMode } from './hooks/useViewMode'
import { useLayers } from './hooks/useLayers'
import type { Layer } from './hooks/useLayers'
import { useLabelMode } from './hooks/useLabelMode'
import { getStation, getLine } from './lib/network'

const LABEL_BTN: Record<string, string> = {
  normal: 'Aa',
  small: 'ᴀ',
  off: '⊘',
}

const LAYER_BTNS: { key: Layer; label: string; title: string }[] = [
  { key: 'construction', label: 'Construção', title: 'Mostrar/ocultar trechos em construção' },
  { key: 'study', label: 'Estudo', title: 'Mostrar/ocultar trechos em estudo' },
  { key: 'speculation', label: 'Especulação', title: 'Mostrar/ocultar trechos especulativos' },
  { key: 'intercity', label: 'Intercidades', title: 'Mostrar/ocultar trens intercidades' },
]

export default function App() {
  const selection = useSelection((s) => s.selection)
  const mode = useViewMode((s) => s.mode)
  const toggleMode = useViewMode((s) => s.toggle)
  const layers = useLayers()
  const labelMode = useLabelMode((s) => s.mode)
  const cycleLabels = useLabelMode((s) => s.cycle)

  const station =
    selection?.kind === 'station' ? getStation(selection.id) : undefined
  const line = selection?.kind === 'line' ? getLine(selection.id) : undefined

  const chip = (active: boolean) =>
    'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ' +
    (active ? 'bg-white text-[#0455a1]' : 'bg-white/15 hover:bg-white/25')

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="shrink-0 bg-[#0455a1] text-white px-3 py-2 shadow-md z-10 flex items-center gap-x-3 gap-y-1.5 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <h1 className="text-sm font-bold leading-tight">
            Rede Metroferroviária de São Paulo
          </h1>
          <p className="text-[10px] text-blue-100 truncate">
            Estação → mapa · Linha → status e notícias
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
          <button
            onClick={cycleLabels}
            className={chip(false) + ' w-8'}
            title="Tamanho dos nomes: normal / pequeno / oculto"
          >
            {LABEL_BTN[labelMode]}
          </button>
          {LAYER_BTNS.map((b) => (
            <button
              key={b.key}
              onClick={() => layers.toggle(b.key)}
              className={chip(layers[b.key])}
              title={b.title}
              aria-pressed={layers[b.key]}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={toggleMode}
            className={chip(false)}
            title="Alternar diagrama esquemático / mapa geográfico"
          >
            {mode === 'schematic' ? '🗺️ Geo' : '📐 Esq'}
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
