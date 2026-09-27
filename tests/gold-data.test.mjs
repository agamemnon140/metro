import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { applyReviewedGoldLine } from '../scripts/lib/reviewed-gold-line.mjs'

const network = JSON.parse(readFileSync(new URL('../src/data/network.json', import.meta.url), 'utf8'))

test('Ouro tem oito estações atuais e bifurcação em Brooklin, sem ligar os dois terminais', () => {
  const gold = network.lines.find((line) => line.id === '17')
  const routes = gold.routes.filter((route) => route.phase === 'operando')
  const edges = routes.flatMap((route) => route.stationIds.slice(1).map((id, i) => [route.stationIds[i], id]))
  const neighbors = (id) => edges.filter((edge) => edge.includes(id)).map((edge) => edge.find((s) => s !== id))
  assert.equal(new Set(routes.flatMap((route) => route.stationIds)).size, 8)
  assert.deepEqual(neighbors('l17-aeroporto-de-congonhas'), ['l17-brooklin-paulista'])
  assert.deepEqual(neighbors('l17-washington-luis'), ['l17-brooklin-paulista'])
  assert.equal(neighbors('l17-brooklin-paulista').length, 3)
  assert.equal(neighbors('sao-paulo-morumbi').length, 0)
})

test('Morumbi é uma única integração 9/17, distinta da conexão futura com a Linha 4', () => {
  const morumbi = network.stations.find((station) => station.id === 'l17-morumbi')
  assert.deepEqual(morumbi.lineIds, ['9', '17'])
  for (const key of ['stationOrder', 'geoOrder']) {
    const order = network.lines.find((line) => line.id === '9')[key]
    assert.deepEqual(order.slice(order.indexOf('berrini'), order.indexOf('berrini') + 3), ['berrini', 'l17-morumbi', 'granja-julieta'])
  }
  assert.equal(network.stations.find((station) => station.id === 'sao-paulo-morumbi').linePhases['17'], 'estudo')
})

test('reaplicar a revisão é idempotente e mantém a geometria da bifurcação', () => {
  const reapplied = applyReviewedGoldLine(structuredClone(network))
  assert.deepEqual(reapplied, network)
  for (const line of reapplied.lines) {
    for (const id of [...line.stationOrder, ...(line.geoOrder ?? [])]) assert.ok(reapplied.stations.some((station) => station.id === id), `${line.id}: ${id}`)
  }
})

test('a fonte curada antiga também recebe as oito estações e os ramais corrigidos', () => {
  const curated = JSON.parse(readFileSync(new URL('../src/data/network.curated.json', import.meta.url), 'utf8'))
  const corrected = applyReviewedGoldLine(curated)
  assert.deepEqual(corrected.lines.find((line) => line.id === '17'), network.lines.find((line) => line.id === '17'))
  for (const route of corrected.lines.find((line) => line.id === '17').routes) {
    for (const id of route.stationIds) assert.ok(corrected.stations.find((station) => station.id === id)?.schematic)
  }
})
