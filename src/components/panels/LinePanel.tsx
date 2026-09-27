import { ExternalLink } from 'lucide-react'
import type { Line } from '@/types/network'
import { stationsForLine } from '@/lib/network'
import { lineTextColor } from '@/lib/colors'
import { metroCptmLineUrl, googleNewsUrl } from '@/lib/deeplinks'
import { formatDate } from '@/constants/statusLabels'
import { OPERATOR_META } from '@/constants/operators'
import { useSelection } from '@/hooks/useSelection'
import { Panel } from './Panel'
import { StationRoute } from './StationRoute'
import { StatusBadge } from '../StatusBadge'

const INDICATIVE_STATUS = new Set(['contratacao', 'elaboracao', 'estudo'])

export function LinePanel({ line }: { line: Line }) {
  const clear = useSelection((s) => s.clear)
  const stations = stationsForLine(line, 'geographic')

  return (
    <Panel key={line.id} accent={line.color} onClose={clear}
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl px-1 text-sm font-bold"
            style={{ backgroundColor: line.color, color: lineTextColor(line) }}>{line.number}</span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight">{line.fullName}</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{OPERATOR_META[line.operator].label}</p>
          </div>
        </div>
      }
      summary={
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={line.status} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{stations.length} estações</span>
          </div>
          {stations.length > 0 && <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{stations[0].name} <span aria-hidden="true">↔</span> {stations[stations.length - 1].name}</p>}
          {INDICATIVE_STATUS.has(line.status) && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Linha futura: traçado e estações indicativos, para localização aproximada.</p>}
        </div>
      }>
      <StationRoute line={line} stations={stations} />
      <section className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-semibold">Atualizações</h3>
        {line.updates.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Sem atualizações registradas.</p> : (
          <ul className="flex flex-col gap-4">
            {line.updates.map((update, index) => (
              <li key={index} className="border-l-2 pl-3" style={{ borderColor: line.color }}>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{formatDate(update.date)}</p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{update.text}</p>
                {update.sourceUrl && <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300">Ver fonte <ExternalLink size={14} aria-hidden="true" /></a>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-semibold">Notícias</h3>
        <div className="flex flex-col gap-2">
          <a href={metroCptmLineUrl(line.number)} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded-xl border border-gray-200 px-3 text-sm font-medium dark:border-gray-700">Ler no metrôCPTM <ExternalLink size={16} aria-hidden="true" /></a>
          <a href={googleNewsUrl(line.newsQuery)} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">Buscar no Google Notícias <ExternalLink size={16} aria-hidden="true" /></a>
        </div>
      </section>
    </Panel>
  )
}
