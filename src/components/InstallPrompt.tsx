import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!evt || dismissed) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 px-3 py-2">
      <span className="text-sm text-gray-700 dark:text-gray-200">Instalar o app?</span>
      <button
        onClick={() => {
          evt.prompt()
          setDismissed(true)
        }}
        className="min-h-11 rounded-lg bg-[#0455a1] px-3 py-1 text-sm font-semibold text-white"
      >
        Instalar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="min-h-11 min-w-11 rounded-lg text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Dispensar"
      >
        ✕
      </button>
    </div>
  )
}
