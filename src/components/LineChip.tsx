import type { Line } from '@/types/network'
import { lineTextColor } from '@/lib/colors'

interface Props {
  line: Line
  onClick?: () => void
  showName?: boolean
}

/** Selo da linha: badge com o número na cor oficial + nome opcional. */
export function LineChip({ line, onClick, showName = true }: Props) {
  const content = (
    <>
      <span
        className="inline-flex items-center justify-center rounded-md text-xs font-bold w-6 h-6 shrink-0"
        style={{ backgroundColor: line.color, color: lineTextColor(line) }}
      >
        {line.number}
      </span>
      {showName && (
        <span className="truncate text-sm text-gray-800 dark:text-gray-100">{line.name}</span>
      )}
    </>
  )

  if (!onClick) {
    return <span className="inline-flex items-center gap-2">{content}</span>
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition"
      title={line.fullName}
    >
      {content}
    </button>
  )
}
