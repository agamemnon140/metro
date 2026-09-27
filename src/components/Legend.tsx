import { useEffect, useRef, useState } from 'react'
import { TrainFront } from 'lucide-react'
import { network } from '@/lib/network'
import { OPERATOR_META } from '@/constants/operators'
import { lineTextColor } from '@/lib/colors'
import { useSelection } from '@/hooks/useSelection'
import { StatusBadge } from './StatusBadge'

const lines = [...network.lines].sort((a, b) =>
  Number(Boolean(a.intercity)) - Number(Boolean(b.intercity)) ||
  a.number.localeCompare(b.number, 'pt-BR', { numeric: true }))

export function Legend() {
  const [open, setOpen] = useState(false)
  const selectLine = useSelection((s) => s.selectLine)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  return (
    <div ref={rootRef} className="absolute top-3 left-3 z-10"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-sm border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
        aria-expanded={open} aria-controls="line-list">
        <TrainFront size={16} aria-hidden="true" />Linhas
      </button>
      {open && (
        <div id="line-list" className="mt-2 w-80 max-w-[calc(100vw-1.5rem)] max-h-[min(65dvh,calc(100dvh-13rem))] overflow-y-auto overscroll-contain touch-pan-y rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <p className="px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Selecione uma linha para explorar</p>
          <ul className="flex flex-col gap-1">
            {lines.map((line) => (
              <li key={line.id}>
                <button onClick={() => { selectLine(line.id); setOpen(false) }}
                  className="flex min-h-14 w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-1 text-xs font-bold"
                    style={{ backgroundColor: line.color, color: lineTextColor(line) }}>{line.number}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">{line.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{OPERATOR_META[line.operator].label}</span>
                  </span>
                  <StatusBadge status={line.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
