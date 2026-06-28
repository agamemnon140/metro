import type { Station } from '@/types/network'
import { linesForStation } from '@/lib/network'
import { googleMapsUrl, appleMapsUrl } from '@/lib/deeplinks'
import { detectPlatform } from '@/lib/platform'
import { useSelection } from '@/hooks/useSelection'
import { Panel } from './Panel'
import { LineChip } from '../LineChip'

export function StationPanel({ station }: { station: Station }) {
  const clear = useSelection((s) => s.clear)
  const selectLine = useSelection((s) => s.selectLine)
  const lines = linesForStation(station)
  const platform = detectPlatform()

  const primary =
    'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white'
  const secondary =
    'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold border border-gray-300 text-gray-800'

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
      onClose={clear}
      title={
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Estação</p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {station.name}
          </h2>
        </div>
      }
    >
      <section className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
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

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Ver no mapa
        </h3>
        {platform === 'apple' ? (
          <>
            {appleBtn}
            {googleBtn}
          </>
        ) : (
          <>
            {googleBtn}
            {appleBtn}
          </>
        )}
      </section>
    </Panel>
  )
}
