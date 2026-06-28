# Rede Metroferroviária de São Paulo

PWA para visualizar a rede de metrô e trens de São Paulo como um diagrama
esquemático ilustrativo, mostrando os cruzamentos entre as linhas.

## Funcionalidades

- **Diagrama esquemático** (SVG) com o código de cores oficial de cada linha.
- **Pan + zoom**: nomes das estações aparecem conforme o nível de zoom
  (baldeações e terminais sempre visíveis).
- **Clique numa estação** → abre o ponto no **Google Maps** ou **Apple Maps**.
- **Clique numa linha** → status (operação / construção / expansão / planejamento),
  atualizações curadas e botão para as **últimas notícias** daquela linha.
- **PWA**: instalável e funciona offline.

## Escopo

Rede integrada completa: Metrô (1, 2, 3, 4, 5, 15), CPTM (7–13), monotrilhos e
linhas futuras (6, 17, 19, 20, 22). No MVP, as linhas 1-Azul, 2-Verde e
3-Vermelha já estão desenhadas; as demais têm dados/status e entram no diagrama
progressivamente (basta editar `src/data/network.json`).

## Stack

React + TypeScript + Vite + Tailwind, diagrama em SVG, pan/zoom com
`react-zoom-pan-pinch`, estado com `zustand`, PWA via `vite-plugin-pwa`.

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção (dist/)
npm run preview    # serve o build
```

## Dados

Todo o modelo da rede vive em `src/data/network.json` (estático, sem backend).
Cada estação guarda a posição no diagrama (`schematic`) **e** coordenadas reais
(`geo`), o que permite adicionar uma visão geográfica no futuro sem refazer dados.
