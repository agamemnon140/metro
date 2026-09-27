import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Geográfico', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('controles legíveis, tema e opções cabem na tela', async ({ page }, testInfo) => {
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', testInfo.project.use.viewport!.width)
  for (const name of ['Diagrama', 'Geográfico', 'Exibição', 'Aproximar', 'Afastar', 'Centralizar mapa']) {
    const box = await page.getByRole('button', { name, exact: true }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await page.screenshot({ path: testInfo.outputPath('mapa-claro.png') })
  await page.getByRole('button', { name: 'Exibição', exact: true }).click()
  const panel = page.locator('#display-options')
  const box = await panel.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width)
  expect(box!.y + box!.height).toBeLessThanOrEqual(testInfo.project.use.viewport!.height)
  await page.getByLabel('Nomes das estações').selectOption('todos')
  await page.getByRole('button', { name: /Tema escuro/ }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: testInfo.outputPath('exibicao-escuro.png') })
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Exibição', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Diagrama', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Diagrama', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('extensões usam tracejado e projetos usam pontilhado', async ({ page }, testInfo) => {
  // Select by accessible name instead of relying on colors or dataset ordering.
  const line = page.getByRole('button', { name: /Linha.*2.*Verde/ })
  await expect(line.locator('path[stroke-dasharray]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Exibição', exact: true }).click()
  await page.getByRole('checkbox', { name: /Em construção/ }).check()
  await page.getByRole('checkbox', { name: /Em estudo/ }).check()
  await page.keyboard.press('Escape')
  await expect(line.locator('path[stroke-dasharray="12 10"]')).not.toHaveCount(0)
  await expect(line.locator('path[opacity="0.95"]:not([stroke-dasharray])')).not.toHaveCount(0)
  await expect(page.locator('main svg g[role="button"] path[stroke-dasharray="1 10"]').first()).toBeAttached()
  await expect(page.getByLabel('Legenda dos traçados')).toBeVisible()
  await page.getByRole('button', { name: 'Diagrama', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('diagrama-camadas.png') })
  await page.getByRole('button', { name: 'Exibição', exact: true }).click()
  await page.getByRole('checkbox', { name: /Em construção/ }).uncheck()
  await page.getByRole('checkbox', { name: /Em estudo/ }).uncheck()
  await page.keyboard.press('Escape')
  await expect(line.locator('path[stroke-dasharray]')).toHaveCount(0)
  await expect(page.getByLabel('Legenda dos traçados')).toHaveCount(0)
})

test('nomes não se sobrepõem ao focar uma linha e podem ser ocultados', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'Linhas', exact: true }).click()
  await page.getByRole('button', { name: /^1 Azul/ }).click()
  const labels = page.locator('[data-station-labels] text')
  await expect(labels.first()).toBeAttached()
  const collisions = await labels.evaluateAll((nodes) => {
    const boxes = nodes.map((n) => n.getBoundingClientRect())
    return boxes.flatMap((a, i) => boxes.slice(i + 1).filter((b) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top))
      .length
  })
  expect(collisions).toBe(0)
  await page.screenshot({ path: testInfo.outputPath('linha-selecionada.png') })
  // Close the detail panel, set hiding, then focus the same line again.
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.getByRole('button', { name: 'Exibição', exact: true }).click()
  await page.getByLabel('Nomes das estações').selectOption('off')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Linhas', exact: true }).click()
  await page.getByRole('button', { name: /^1 Azul/ }).click()
  await expect(labels).toHaveCount(0)
})
