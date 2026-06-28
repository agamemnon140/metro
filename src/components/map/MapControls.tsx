interface Props {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onReset }: Props) {
  const btn =
    'w-10 h-10 flex items-center justify-center rounded-lg bg-white/95 shadow ' +
    'border border-gray-200 text-gray-700 text-xl font-semibold ' +
    'hover:bg-white active:scale-95 transition'

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
