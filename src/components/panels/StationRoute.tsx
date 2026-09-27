import type { Line, Station } from '@/types/network'
import { linesForStation } from '@/lib/network'
import { lineTextColor } from '@/lib/colors'
import { useSelection } from '@/hooks/useSelection'

const PHASE_LABEL = {
  operando: '', construcao: 'Em obras', estudo: 'Em estudo', especulacao: 'Proposta',
}

export function StationRoute({ line, stations }: { line: Line; stations: Station[] }) {
  const selectStation = useSelection((s) => s.selectStation)
  return (
    <section aria-label="Percurso da linha">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Estações</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{stations.length} no percurso</span>
      </div>
      {stations.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Estações ainda não disponíveis.</p> : (
        <ol className="flex flex-col">
          {stations.map((station, index) => {
            const connections = linesForStation(station).filter((l) => l.id !== line.id)
            const planned = (connection: Line) => !['operacao', 'expansao'].includes(connection.status)
            const connectionGroups = [
              { label: 'Conexões', lines: connections.filter((connection) => !planned(connection)) },
              { label: 'Previstas', lines: connections.filter(planned) },
            ]
            const phaseLabel = PHASE_LABEL[station.phase ?? 'operando']
            return (
              <li key={station.id} className="relative pl-7">
                {index > 0 && <span aria-hidden="true" className="absolute left-[9px] top-0 h-6 w-0 border-l-[3px]" style={{ borderColor: line.color }} />}
                {index < stations.length - 1 && <span aria-hidden="true" className="absolute left-[9px] top-6 bottom-0 w-0 border-l-[3px]" style={{ borderColor: line.color }} />}
                <span aria-hidden="true" className="absolute left-1 top-[18px] h-[13px] w-[13px] rounded-full border-[3px] bg-white dark:bg-gray-900" style={{ borderColor: line.color }} />
                <button onClick={() => selectStation(station.id)} aria-label={'Ver estação ' + station.name}
                  className="flex min-h-12 w-full flex-col items-start justify-center gap-1 rounded-xl px-2 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="text-sm font-medium leading-snug">{station.name}</span>
                  {(connections.length > 0 || phaseLabel) && (
                    <span className="flex flex-wrap items-center gap-1.5">
                      {phaseLabel && <span className="text-xs text-gray-600 dark:text-gray-400">{phaseLabel}</span>}
                      {connectionGroups.filter((group) => group.lines.length > 0).map((group) => (
                        <span key={group.label} className="flex flex-wrap items-center gap-1.5">
                          <span className="mr-1 text-xs text-gray-500 dark:text-gray-400">{group.label}</span>
                          {group.lines.map((connection) => (
                            <span key={connection.id} title={connection.fullName} aria-label={connection.fullName}
                              className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-bold"
                              style={{ backgroundColor: connection.color, color: lineTextColor(connection) }}>{connection.number}</span>
                          ))}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
