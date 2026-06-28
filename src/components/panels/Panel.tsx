import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  accent?: string
  onClose: () => void
  children: ReactNode
}

export function Panel({ title, accent, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* backdrop só no mobile */}
      <div
        className="fixed inset-0 z-20 bg-black/20 sm:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed z-30 bg-white shadow-2xl flex flex-col
                   inset-x-0 bottom-0 max-h-[75vh] rounded-t-2xl
                   sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[380px] sm:max-h-none sm:rounded-none"
      >
        <header
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
          style={accent ? { borderTopColor: accent } : undefined}
        >
          <div className="flex-1 min-w-0">{title}</div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 shrink-0 rounded-full hover:bg-gray-100 text-gray-500 text-lg"
          >
            ✕
          </button>
        </header>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </aside>
    </>
  )
}
