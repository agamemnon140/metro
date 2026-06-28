import type { Line } from '@/types/network'

/** Cor de texto legível sobre uma cor de fundo hex (#rrggbb). */
export function readableTextColor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  // luminância relativa aproximada
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff'
}

/** Cor de texto a usar sobre a cor da linha (respeita override do dataset). */
export function lineTextColor(line: Line): string {
  return line.textColor ?? readableTextColor(line.color)
}
