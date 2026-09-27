import type { LineStatus } from '@/types/network'
import { STATUS_META } from '@/constants/statusLabels'

const TONES: Record<LineStatus, string> = {
  operacao: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  expansao: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  construcao: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  contratacao: 'bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  elaboracao: 'bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  estudo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
}

export function StatusBadge({ status }: { status: LineStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={'inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ' + TONES[status]}
    >
      {meta.label}
    </span>
  )
}
