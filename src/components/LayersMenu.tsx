import { useEffect, useRef, useState } from 'react'
import { Layers, Check } from 'lucide-react'
import { useLayers } from '@/hooks/useLayers'
import type { Layer } from '@/hooks/useLayers'

const ITEMS: { key: Layer; label: string; hint: string }[] = [
  { key: 'construction', label: 'Construção', hint: 'Trechos em obras' },
  { key: 'study', label: 'Estudo', hint: 'Trechos em estudo/projeto' },
  { key: 'speculation', label: 'Especulação', hint: 'Traçados especulativos' },
  { key: 'intercity', label: 'Intercidades', hint: 'Trens intercidades' },
]

export function LayersMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const layers = useLayers()
  const activeCount = ITEMS.filter((i) => layers[i.key]).length

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Mostrar/ocultar camadas do mapa"
        className={
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ' +
          (activeCount > 0
            ? 'bg-white text-[#0455a1]'
            : 'bg-white/15 hover:bg-white/25 text-white')
        }
      >
        <Layers size={14} />
        <span className="hidden sm:inline">Camadas</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-[#0455a1] text-white text-[10px] font-bold w-4 h-4">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 z-20">
          {ITEMS.map((item) => {
            const active = layers[item.key]
            return (
              <button
                key={item.key}
                onClick={() => layers.toggle(item.key)}
                aria-pressed={active}
                className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span
                  className={
                    'flex items-center justify-center w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded border ' +
                    (active
                      ? 'bg-[#0455a1] border-[#0455a1] text-white'
                      : 'border-gray-300 dark:border-gray-500 text-transparent')
                  }
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                    {item.hint}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
