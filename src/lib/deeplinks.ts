import type { GeoPoint, Station } from '@/types/network'

// Constrói o termo de busca da estação. Usar o nome torna o link robusto
// mesmo com coordenadas aproximadas — o Google/Apple conhecem as estações.
function stationQuery(station: Station): string {
  return `Estação ${station.name}, Metrô São Paulo`
}

/** Abre o ponto da estação no Google Maps (app nativo ou web). */
export function googleMapsUrl(station: Station): string {
  const q = encodeURIComponent(stationQuery(station))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

/** Abre o ponto da estação no Apple Maps, centrado nas coordenadas. */
export function appleMapsUrl(station: Station): string {
  const { lat, lng }: GeoPoint = station.geo
  const q = encodeURIComponent(stationQuery(station))
  return `https://maps.apple.com/?q=${q}&ll=${lat},${lng}`
}

/** Página da linha no metrôCPTM — fonte principal de notícias. */
export function metroCptmLineUrl(number: string): string {
  return `https://www.metrocptm.com.br/linha-${number}/`
}

/** Busca de notícias recentes sobre uma linha (Google News, pt-BR) — secundária. */
export function googleNewsUrl(query: string): string {
  const q = encodeURIComponent(query)
  return `https://news.google.com/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
}
