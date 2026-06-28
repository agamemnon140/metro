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
    <div className="absolute bottom-4 left-3 z-10 flex items-center gap-2 rounded-xl bg-white/97 shadow-lg border border-gray-200 px-3 py-2">
      <span className="text-sm text-gray-700">Instalar o app?</span>
      <button
        onClick={() => {
          evt.prompt()
          setDismissed(true)
        }}
        className="rounded-lg bg-[#0455a1] px-3 py-1 text-sm font-semibold text-white"
      >
        Instalar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 text-sm px-1"
        aria-label="Dispensar"
      >
        ✕
      </button>
    </div>
  )
}
