import { useMemo, useState } from 'react'
import { TrainFront } from 'lucide-react'
import type { Line, Operator } from '@/types/network'
import { network } from '@/lib/network'
import { STATUS_META } from '@/constants/statusLabels'
import { OPERATOR_META } from '@/constants/operators'
import { lineTextColor } from '@/lib/colors'
import { useSelection } from '@/hooks/useSelection'

export function Legend() {
  const [open, setOpen] = useState(false)
  const selectLine = useSelection((s) => s.selectLine)

  const groups = useMemo(() => {
    const byOp = new Map<Operator, Line[]>()
    for (const line of network.lines) {
      const arr = byOp.get(line.operator) ?? []
      arr.push(line)
      byOp.set(line.operator, arr)
    }
    return [...byOp.entries()].sort(
      (a, b) => OPERATOR_META[a[0]].order - OPERATOR_META[b[0]].order,
    )
  }, [])

  return (
    <div className="absolute top-3 left-3 z-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-white/95 dark:bg-gray-800/95 shadow border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
        aria-expanded={open}
      >
        <TrainFront size={16} />
        Linhas
      </button>

      {open && (
        <div className="mt-2 w-64 max-h-[60vh] overflow-y-auto rounded-xl bg-white/97 dark:bg-gray-800/97 shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          {groups.map(([operator, lines]) => (
            <section key={operator}>
              <h3 className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {OPERATOR_META[operator].label}
              </h3>
              <ul className="flex flex-col">
                {lines.map((line) => (
                  <li key={line.id}>
                    <button
                      onClick={() => {
                        selectLine(line.id)
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    >
                      <span
                        className="inline-flex items-center justify-center rounded-md text-xs font-bold w-6 h-6 shrink-0"
                        style={{ backgroundColor: line.color, color: lineTextColor(line) }}
                      >
                        {line.number}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-gray-800 dark:text-gray-100 truncate">
                          {line.name}
                        </span>
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_META[line.status].color }}
                        title={STATUS_META[line.status].label}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="px-2 pt-2 text-[11px] leading-tight text-gray-400 dark:text-gray-500">
            Pontinho colorido = status (operação, construção, expansão, planejamento).
          </p>
        </div>
      )}
    </div>
  )
}
