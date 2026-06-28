// Detecção simples de plataforma para destacar (não esconder) o mapa nativo.

export type Platform = 'apple' | 'android' | 'desktop'

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return 'apple'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}
