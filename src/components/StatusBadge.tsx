import type { LineStatus } from '@/types/network'
import { STATUS_META } from '@/constants/statusLabels'

export function StatusBadge({ status }: { status: LineStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  )
}
