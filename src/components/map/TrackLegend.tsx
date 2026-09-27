import { TRACK_STYLES } from '@/lib/lineSegments'
import { useLayers } from '@/hooks/useLayers'

export function TrackLegend() {
  const layers = useLayers()
  if (!layers.construction && !layers.study && !layers.speculation && !layers.intercity) return null

  return (
    <div aria-label="Legenda dos traçados" className="pointer-events-none absolute bottom-4 left-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-3 py-2 shadow-sm">
      {Object.entries(TRACK_STYLES).map(([key, style]) => (
        <div key={key} className="flex items-center gap-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
          <svg width="32" height="12" viewBox="0 0 44 12" aria-hidden="true">
            <path d="M 3 6 H 41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={style.dash} />
          </svg>
          {style.label}
        </div>
      ))}
    </div>
  )
}
