import type { LineStatus } from '@/types/network'

export const STATUS_META: Record<
  LineStatus,
  { label: string; color: string }
> = {
  operacao: { label: 'Em operação', color: '#1f8a4c' },
  construcao: { label: 'Em construção', color: '#e08a00' },
  expansao: { label: 'Em expansão', color: '#1d6fb8' },
  planejamento: { label: 'Em planejamento', color: '#7a52b3' },
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
