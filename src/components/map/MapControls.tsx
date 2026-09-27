interface Props {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onReset }: Props) {
  const btn =
    'w-11 h-11 flex items-center justify-center rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-sm ' +
    'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xl font-semibold ' +
    'hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition'

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      <button className={btn} onClick={onZoomIn} aria-label="Aproximar">
        +
      </button>
      <button className={btn} onClick={onZoomOut} aria-label="Afastar">
        −
      </button>
      <button
        className={btn + ' text-sm'}
        onClick={onReset}
        aria-label="Centralizar mapa"
        title="Centralizar"
      >
        ⤢
      </button>
    </div>
  )
}
