import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface Props {
  title: ReactNode
  accent?: string
  onClose: () => void
  summary: ReactNode
  children: ReactNode
}

/** Nonmodal details: the map remains available while the mobile sheet is open. */
export function Panel({ title, accent, onClose, summary, children }: Props) {
  const [expanded, setExpanded] = useState(false)
  const titleId = useId()
  const detailsId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const dragStart = useRef<number | null>(null)
  const dragged = useRef(false)

  useEffect(() => {
    const previous = document.activeElement
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [onClose])

  return (
    <aside ref={panelRef} role="dialog" aria-modal="false" aria-labelledby={titleId} tabIndex={-1}
      className={'fixed z-30 flex flex-col border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ' +
        'inset-x-0 bottom-0 rounded-t-2xl outline-none motion-safe:animate-slide-up ' +
        'sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[380px] sm:rounded-2xl sm:max-h-none sm:motion-safe:animate-slide-in-right ' +
        (expanded ? 'h-[82dvh] sm:h-auto' : 'max-h-[65dvh] sm:h-auto')}>
      {accent && <div className="h-1 shrink-0 rounded-t-2xl" style={{ backgroundColor: accent }} />}
      <button aria-label={expanded ? 'Recolher painel' : 'Expandir painel'} aria-expanded={expanded} aria-controls={detailsId}
        className="flex min-h-11 shrink-0 touch-none items-center justify-center rounded-t-xl sm:hidden"
        onPointerDown={(e) => {
          if (e.button !== 0) return
          dragStart.current = e.clientY
          dragged.current = false
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (dragStart.current === null) return
          const distance = e.clientY - dragStart.current
          if (Math.abs(distance) > 35) {
            dragged.current = true
            setExpanded(distance < 0)
          }
        }}
        onPointerUp={() => { dragStart.current = null }}
        onPointerCancel={() => { dragStart.current = null; dragged.current = true }}
        onClick={() => { if (!dragged.current) setExpanded((v) => !v); dragged.current = false }}>
        <span className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
      </button>
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 pb-3 sm:pt-4 dark:border-gray-800">
        <div id={titleId} className="min-w-0 flex-1">{title}</div>
        <button onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {summary}
        <button onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-controls={detailsId}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 text-sm font-semibold dark:bg-gray-800 sm:hidden">
          {expanded ? 'Recolher detalhes' : 'Ver detalhes'}
          {expanded ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
        </button>
        <div id={detailsId} className={(expanded ? 'block' : 'hidden') + ' pt-5 sm:block'}>{children}</div>
      </div>
    </aside>
  )
}
