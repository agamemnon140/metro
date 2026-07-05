import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { lineTextColor } from '@/lib/colors'
import { metroCptmLineUrl, googleNewsUrl } from '@/lib/deeplinks'
import { formatDate } from '@/constants/statusLabels'
import { useSelection } from '@/hooks/useSelection'
import { Panel } from './Panel'
import { StatusBadge } from '../StatusBadge'

const INDICATIVE_STATUS = new Set(['contratacao', 'elaboracao', 'estudo'])

export function LinePanel({ line }: { line: Line }) {
  const clear = useSelection((s) => s.clear)
  const selectStation = useSelection((s) => s.selectStation)
  // lista completa de estações (ordem geográfica = todas)
  const stations = stationsForLine(line, 'geographic')

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
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {line.fullName}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{line.operator}</p>
          </div>
        </div>
      }
    >
      <div className="mb-4">
        <StatusBadge status={line.status} />
      </div>

      {INDICATIVE_STATUS.has(line.status) && (
        <p className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          ⚠️ Linha futura: o traçado e as estações no mapa são <b>indicativos</b> (não
          oficiais), apenas para localização aproximada.
        </p>
      )}

      <section className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Atualizações
        </h3>
        {line.updates.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Sem atualizações registradas.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {line.updates.map((u, i) => (
              <li key={i} className="border-l-2 pl-3" style={{ borderColor: line.color }}>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{formatDate(u.date)}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{u.text}</p>
                {u.sourceUrl && (
                  <a
                    href={u.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    fonte ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="mb-5 group">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Notícias (metrôCPTM) <span className="text-gray-300 group-open:hidden">▸</span>
            <span className="text-gray-300 hidden group-open:inline">▾</span>
          </h3>
          <a
            href={metroCptmLineUrl(line.number)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold hover:underline"
            style={{ color: line.color }}
            onClick={(e) => e.stopPropagation()}
          >
            abrir ↗
          </a>
        </summary>
        <iframe
          key={line.id}
          src={metroCptmLineUrl(line.number)}
          title={`Notícias da ${line.fullName} no metrôCPTM`}
          loading="lazy"
          className="mt-2 w-full h-[240px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
        />
        <a
          href={googleNewsUrl(line.newsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-gray-500 dark:text-gray-400 hover:underline mt-2"
        >
          ou buscar no Google Notícias ↗
        </a>
      </details>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Estações {stations.length > 0 && `(${stations.length})`}
        </h3>
        {stations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Traçado ainda não desenhado no diagrama — em breve.
          </p>
        ) : (
          <ul className="flex flex-col">
            {stations.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => selectStation(s.id)}
                  className="w-full flex items-center gap-2 py-1.5 text-left text-sm text-gray-800 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 bg-white dark:bg-gray-900"
                    style={{
                      backgroundColor: s.interchange ? undefined : line.color,
                      border: s.interchange ? `2px solid ${line.color}` : 'none',
                    }}
                  />
                  <span className="truncate">{s.name}</span>
                  {s.interchange && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">baldeação</span>
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
