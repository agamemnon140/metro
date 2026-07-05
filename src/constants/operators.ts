import type { Operator } from '@/types/network'

export const OPERATOR_META: Record<Operator, { label: string; order: number }> = {
  metro: { label: 'Metrô', order: 0 },
  viaquatro: { label: 'ViaQuatro', order: 1 },
  viamobilidade: { label: 'ViaMobilidade', order: 2 },
  cptm: { label: 'CPTM', order: 3 },
  outro: { label: 'Outros', order: 4 },
}
