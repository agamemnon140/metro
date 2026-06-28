import { useState } from 'react'
import { network } from '@/lib/network'
import { STATUS_META } from '@/constants/statusLabels'
import { lineTextColor } from '@/lib/colors'
import { useSelection } from '@/hooks/useSelection'

export function Legend() {
  const [open, setOpen] = useState(false)
  const selectLine = useSelection((s) => s.selectLine)

  return (
    <div className="absolute top-3 left-3 z-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-white/95 shadow border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
        aria-expanded={open}
      >
        ☰ Linhas
      </button>

      {open && (
        <div className="mt-2 w-64 max-h-[60vh] overflow-y-auto rounded-xl bg-white/97 shadow-lg border border-gray-200 p-2">
          <ul className="flex flex-col">
            {network.lines.map((line) => (
              <li key={line.id}>
                <button
                  onClick={() => {
                    selectLine(line.id)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 text-left"
                >
                  <span
                    className="inline-flex items-center justify-center rounded-md text-xs font-bold w-6 h-6 shrink-0"
                    style={{ backgroundColor: line.color, color: lineTextColor(line) }}
                  >
                    {line.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-gray-800 truncate">
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
          <p className="px-2 pt-2 text-[11px] leading-tight text-gray-400">
            Pontinho colorido = status (operação, construção, expansão, planejamento).
          </p>
        </div>
      )}
    </div>
  )
}
