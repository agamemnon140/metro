import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { lineTextColor } from '@/lib/colors'
import { googleNewsUrl } from '@/lib/deeplinks'
import { formatDate } from '@/constants/statusLabels'
import { useSelection } from '@/hooks/useSelection'
import { Panel } from './Panel'
import { StatusBadge } from '../StatusBadge'

export function LinePanel({ line }: { line: Line }) {
  const clear = useSelection((s) => s.clear)
  const selectStation = useSelection((s) => s.selectStation)
  const stations = stationsForLine(line)

  return (
    <Panel
      accent={line.color}
      onClose={clear}
      title={
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center rounded-md text-sm font-bold w-7 h-7"
            style={{ backgroundColor: line.color, color: lineTextColor(line) }}
          >
            {line.number}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {line.fullName}
            </h2>
            <p className="text-xs text-gray-400 capitalize">{line.operator}</p>
          </div>
        </div>
      }
    >
      <div className="mb-4">
        <StatusBadge status={line.status} />
      </div>

      <section className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Atualizações
        </h3>
        {line.updates.length === 0 ? (
          <p className="text-sm text-gray-500">Sem atualizações registradas.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {line.updates.map((u, i) => (
              <li key={i} className="border-l-2 pl-3" style={{ borderColor: line.color }}>
                <p className="text-xs font-medium text-gray-400">{formatDate(u.date)}</p>
                <p className="text-sm text-gray-800">{u.text}</p>
                {u.sourceUrl && (
                  <a
                    href={u.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    fonte ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <a
        href={googleNewsUrl(line.newsQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white mb-5"
        style={{ backgroundColor: line.color, color: lineTextColor(line) }}
      >
        Ver últimas notícias ↗
      </a>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Estações {stations.length > 0 && `(${stations.length})`}
        </h3>
        {stations.length === 0 ? (
          <p className="text-sm text-gray-500">
            Traçado ainda não desenhado no diagrama — em breve.
          </p>
        ) : (
          <ul className="flex flex-col">
            {stations.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => selectStation(s.id)}
                  className="w-full flex items-center gap-2 py-1.5 text-left text-sm text-gray-800 hover:text-gray-950"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: s.interchange ? '#fff' : line.color,
                      border: s.interchange ? `2px solid ${line.color}` : 'none',
                    }}
                  />
                  <span className="truncate">{s.name}</span>
                  {s.interchange && (
                    <span className="text-[10px] text-gray-400">baldeação</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Panel>
  )
}
