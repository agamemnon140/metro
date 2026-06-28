// Tipos do modelo de dados da rede metroferroviária de São Paulo.
// O dado guarda DUAS coordenadas por estação: schematic (x/y do diagrama) e
// geo (lat/lng reais). A renderização hoje usa schematic; geo serve aos
// deep-links de mapa e a uma futura visão geográfica — sem mudar o schema.

// Maturidade do projeto, da mais consolidada à mais preliminar:
// operação → expansão (linha opera, trecho novo em obras) → construção →
// contratação (licitação/contrato) → elaboração (projeto básico, estações já
// esboçadas) → estudo (estudo funcional/preliminar, traçado indicativo).
export type LineStatus =
  | 'operacao'
  | 'expansao'
  | 'construcao'
  | 'contratacao'
  | 'elaboracao'
  | 'estudo'

export type Operator =
  | 'metro'
  | 'cptm'
  | 'viamobilidade'
  | 'viaquatro'
  | 'outro'

export type RailKind = 'metro' | 'trem' | 'monotrilho'

export interface SchematicPoint {
  x: number
  y: number
}

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Station {
  /** slug estável, ex.: "se", "luz", "paulista" */
  id: string
  name: string
  /** todas as linhas que servem esta estação */
  lineIds: string[]
  /** baldeação: >1 linha ou hub oficial de transferência */
  interchange: boolean
  /** posição no diagrama esquemático */
  schematic: SchematicPoint
  /** coordenada real (semeada de OSM/Wikidata) — usada nos mapas */
  geo: GeoPoint
  /** 1 = nome sempre visível; 2 = zoom médio; 3 = só zoom alto */
  labelTier: 1 | 2 | 3
  /** ancoragem do texto do rótulo (default: start) */
  labelAnchor?: 'start' | 'middle' | 'end'
  /** deslocamento do rótulo em unidades do canvas */
  labelOffset?: SchematicPoint
}

export interface LineUpdate {
  /** ISO, ex.: "2026-05-12" */
  date: string
  text: string
  sourceUrl?: string
}

export interface Line {
  /** id único, ex.: "1", "4", "15" */
  id: string
  /** rótulo do número, ex.: "1", "15" */
  number: string
  /** nome de cor, ex.: "Azul", "Amarela" */
  name: string
  /** nome completo, ex.: "Linha 1–Azul" */
  fullName: string
  /** cor oficial em hex, ex.: "#0455a1" */
  color: string
  /** cor do texto sobre a cor da linha (default: calculada) */
  textColor?: string
  operator: Operator
  kind: RailKind
  status: LineStatus
  /** ordem das estações que define a geometria do traçado */
  stationOrder: string[]
  /** atualizações curadas (mais recentes primeiro) */
  updates: LineUpdate[]
  /** consulta para o deep-link de notícias, ex.: "Linha 6-Laranja Metrô SP" */
  newsQuery: string
  /** se a geometria já está desenhada no diagrama (flag do MVP) */
  drawn: boolean
}

export interface NetworkData {
  version: string
  /** ISO da última atualização do dataset */
  updatedAt: string
  /** extensão do canvas esquemático */
  viewBox: { width: number; height: number }
  lines: Line[]
  stations: Station[]
}
