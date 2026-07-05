import type { GeoPoint, SchematicPoint } from '@/types/network'

// Camada decorativa: cursos estilizados dos rios Tietê e Pinheiros.
// - `geo`: vértices lat/lng traçados à mão sobre o curso real (~500 m de
//   precisão basta). São projetados com o MESMO geoToPoint das estações, mas
//   a projeção deriva dos extremos do dataset de estações — se o dataset
//   crescer, os rios acompanham sozinhos.
// - `schematic`: polyline simplificada em coordenadas absolutas do canvas
//   FINAL (network.json, viewBox 1738×1275 — o build translada o curado),
//   calibrada contra estações âncora: Linha 9 corre na margem leste do
//   Pinheiros (rio ~20 un. a oeste das estações); o Tietê passa entre
//   Carandiru (y=212) e Portuguesa-Tietê (y=250) no eixo x=817.

export interface River {
  id: 'tiete' | 'pinheiros'
  name: string
  geo: GeoPoint[]
  schematic: SchematicPoint[]
  /** posição do rótulo por modo (âncora, o texto segue a inclinação local) */
  label: { schematic: SchematicPoint; geographic: GeoPoint }
}

export const RIVERS: River[] = [
  {
    id: 'tiete',
    name: 'Rio Tietê',
    geo: [
      { lat: -23.523, lng: -46.79 },
      { lat: -23.513, lng: -46.755 },
      { lat: -23.508, lng: -46.72 },
      { lat: -23.513, lng: -46.695 },
      { lat: -23.516, lng: -46.665 },
      { lat: -23.515, lng: -46.64 },
      { lat: -23.516, lng: -46.625 },
      { lat: -23.512, lng: -46.6 },
      { lat: -23.507, lng: -46.57 },
      { lat: -23.502, lng: -46.545 },
      { lat: -23.493, lng: -46.52 },
      { lat: -23.487, lng: -46.49 },
      { lat: -23.48, lng: -46.455 },
    ],
    schematic: [
      { x: 340, y: 520 },
      { x: 460, y: 430 },
      { x: 567, y: 348 },
      { x: 680, y: 290 },
      { x: 780, y: 245 },
      { x: 817, y: 232 },
      { x: 900, y: 215 },
      { x: 1100, y: 195 },
      { x: 1350, y: 180 },
      { x: 1710, y: 165 },
    ],
    label: {
      schematic: { x: 1100, y: 178 },
      geographic: { lat: -23.507, lng: -46.575 },
    },
  },
  {
    id: 'pinheiros',
    name: 'Rio Pinheiros',
    geo: [
      { lat: -23.513, lng: -46.755 },
      { lat: -23.53, lng: -46.745 },
      { lat: -23.55, lng: -46.73 },
      { lat: -23.57, lng: -46.715 },
      { lat: -23.59, lng: -46.71 },
      { lat: -23.61, lng: -46.705 },
      { lat: -23.635, lng: -46.715 },
      { lat: -23.66, lng: -46.71 },
      { lat: -23.69, lng: -46.695 },
      { lat: -23.72, lng: -46.685 },
    ],
    schematic: [
      { x: 460, y: 430 },
      { x: 482, y: 520 },
      { x: 517, y: 632 },
      { x: 549, y: 735 },
      { x: 568, y: 855 },
      { x: 577, y: 980 },
      { x: 597, y: 1128 },
      { x: 630, y: 1220 },
      { x: 650, y: 1262 },
    ],
    label: {
      schematic: { x: 512, y: 925 },
      geographic: { lat: -23.648, lng: -46.712 },
    },
  },
]
