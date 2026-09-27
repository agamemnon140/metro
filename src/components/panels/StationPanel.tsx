import type { Station } from '@/types/network'
import { linesForStation } from '@/lib/network'
import { googleMapsUrl, appleMapsUrl } from '@/lib/deeplinks'
import { detectPlatform } from '@/lib/platform'
import { useSelection } from '@/hooks/useSelection'
import { Panel } from './Panel'
import { LineChip } from '../LineChip'

const PHASE_META: Record<string, { label: string; tone: string }> = {
  construcao: { label: 'Em construção', tone: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  estudo: { label: 'Em estudo', tone: 'bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  especulacao: { label: 'Especulação', tone: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200' },
}

export function StationPanel({ station }: { station: Station }) {
  const clear = useSelection((s) => s.clear)
  const selectLine = useSelection((s) => s.selectLine)
  const lines = linesForStation(station)
  const platform = detectPlatform()
  const phase = station.phase && station.phase !== 'operando' ? PHASE_META[station.phase] : null

  const primary =
    'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white'
  const secondary =
    'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'

  const googleBtn = (
    <a
      key="g"
      href={googleMapsUrl(station)}
      target="_blank"
      rel="noopener noreferrer"
      className={platform === 'apple' ? secondary : primary}
      style={platform === 'apple' ? undefined : { backgroundColor: '#1a73e8' }}
    >
      Abrir no Google Maps
    </a>
  )
  const appleBtn = (
    <a
      key="a"
      href={appleMapsUrl(station)}
      target="_blank"
      rel="noopener noreferrer"
      className={platform === 'apple' ? primary : secondary}
      style={platform === 'apple' ? { backgroundColor: '#111' } : undefined}
    >
      Abrir no Apple Maps
    </a>
  )

  return (
    <Panel
      key={station.id}
      accent={lines[0]?.color}
      onClose={clear}
      title={
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Estação</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {station.name}
          </h2>
        </div>
      }
      summary={<>
      {phase && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={'inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ' + phase.tone}
          >
            {phase.label}
          </span>
          {station.eta && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Previsão de inauguração: <b>{station.eta}</b>
            </span>
          )}
        </div>
      )}

      <section className="mb-4">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {lines.length > 1 ? 'Linhas (baldeação)' : 'Linha'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {lines.map((line) => (
            <LineChip
              key={line.id}
              line={line}
              onClick={() => selectLine(line.id)}
            />
          ))}
        </div>
      </section>

      {platform === 'apple' ? appleBtn : googleBtn}
      </>}
    >
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Outras opções de mapa</h3>
        {platform === 'apple' ? googleBtn : appleBtn}
      </section>
    </Panel>
  )
}
