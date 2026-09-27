import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, Sun, Moon } from 'lucide-react'
import { useLayers } from '@/hooks/useLayers'
import type { Layer } from '@/hooks/useLayers'
import { useLabelMode } from '@/hooks/useLabelMode'
import type { LabelMode } from '@/hooks/useLabelMode'
import { useTheme } from '@/hooks/useTheme'

const ITEMS: { key: Layer; label: string; hint: string }[] = [
  { key: 'construction', label: 'Em construção', hint: 'Trechos em obras' },
  { key: 'study', label: 'Em estudo', hint: 'Projetos e traçados indicativos' },
  { key: 'speculation', label: 'Especulação', hint: 'Propostas não confirmadas' },
  { key: 'intercity', label: 'Intercidades', hint: 'Trens entre cidades' },
]

export function DisplayMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const layers = useLayers()
  const labelMode = useLabelMode((s) => s.mode)
  const setLabelMode = useLabelMode((s) => s.set)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
    }}>
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)} aria-expanded={open}
        aria-controls="display-options"
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 sm:px-3 sm:text-sm">
        <SlidersHorizontal size={16} aria-hidden="true" />Exibição
      </button>
      {open && (
        <div id="display-options" className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
          <label htmlFor="station-labels" className="block text-sm font-semibold mb-2">Nomes das estações</label>
          <select id="station-labels" value={labelMode} onChange={(e) => setLabelMode(e.target.value as LabelMode)}
            className="w-full min-h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm">
            <option value="hubs">Baldeações</option>
            <option value="todos">Todas</option>
            <option value="off">Ocultar</option>
          </select>
          <fieldset className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            <legend className="text-sm font-semibold pr-2">Camadas adicionais</legend>
            {ITEMS.map((item) => (
              <label key={item.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg py-2">
                <input type="checkbox" checked={layers[item.key]} onChange={() => layers.toggle(item.key)} className="h-4 w-4 shrink-0 accent-[#0455a1]" />
                <span><span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{item.hint}</span></span>
              </label>
            ))}
          </fieldset>
          <button onClick={toggleTheme} aria-pressed={theme === 'dark'}
            className="mt-3 flex w-full min-h-11 items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-3 text-sm font-medium">
            <span>Tema escuro</span>
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              {theme === 'dark' ? 'Ativado' : 'Desativado'}
              {theme === 'dark' ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
