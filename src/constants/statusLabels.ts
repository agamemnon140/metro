import type { LineStatus } from '@/types/network'

export const STATUS_META: Record<
  LineStatus,
  { label: string; color: string }
> = {
  operacao: { label: 'Em operação', color: '#1f8a4c' },
  expansao: { label: 'Em expansão', color: '#1d6fb8' },
  construcao: { label: 'Em construção', color: '#e08a00' },
  contratacao: { label: 'Em contratação', color: '#7a52b3' },
  elaboracao: { label: 'Em elaboração', color: '#a766c2' },
  estudo: { label: 'Em estudo', color: '#8a8f98' },
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
