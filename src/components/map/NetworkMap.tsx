import { useEffect, useRef, useState } from 'react'
import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch'
import { drawnLines, drawnStations } from '@/lib/network'
import { pointFor, viewBoxFor } from '@/lib/coords'
import { useZoom } from '@/hooks/useZoomLevel'
import { useSelection } from '@/hooks/useSelection'
import { useViewMode } from '@/hooks/useViewMode'
import { useLayers } from '@/hooks/useLayers'
import { LinePath } from './LinePath'
import { RiversLayer } from './RiversLayer'
import { StationNode } from './StationNode'
import { LabelsLayer } from './LabelsLayer'
import { MapControls } from './MapControls'

export function NetworkMap() {
  const setScale = useZoom((s) => s.setScale)
  const clear = useSelection((s) => s.clear)
  const mode = useViewMode((s) => s.mode)
  const layers = useLayers()
  const lines = drawnLines(layers)
  const stations = drawnStations(mode, layers)
  const defaultBox = viewBoxFor(mode)
  const points = stations.map((s) => pointFor(s, mode))
  const fitGeographic = mode === 'geographic' && points.length > 0
  const minX = fitGeographic ? Math.min(...points.map((p) => p.x)) - 45 : 0
  const minY = fitGeographic ? Math.min(...points.map((p) => p.y)) - 45 : 0
  const width = fitGeographic ? Math.max(...points.map((p) => p.x)) - minX + 45 : defaultBox.width
  const height = fitGeographic ? Math.max(...points.map((p) => p.y)) - minY + 45 : defaultBox.height
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new ResizeObserver(([entry]) => {
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [mode])

  const viewportScale = Math.min(viewport.width / width, viewport.height / height) || 1

  return (
    <TransformWrapper
      key={mode}
      minScale={0.4}
      maxScale={16}
      initialScale={1}
      centerOnInit
      limitToBounds={false}
      doubleClick={{ mode: 'zoomIn', step: 0.9 }}
      wheel={{ step: 0.18 }}
      pinch={{ step: 5 }}
      onTransformed={(_ref, state) => setScale(state.scale)}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <MapControls
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onReset={() => resetTransform()}
          />
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <svg
              ref={svgRef}
              viewBox={`${minX} ${minY} ${width} ${height}`}
              width="100%"
              height="100%"
              role="img"
              aria-label={`${mode === 'geographic' ? 'Mapa geográfico' : 'Diagrama'} da rede metroferroviária de São Paulo`}
              onClick={() => clear()}
            >
              <RiversLayer mode={mode} />
              <g>
                {lines.map((line) => (
                  <LinePath key={line.id} line={line} />
                ))}
              </g>
              <g>
                {stations.map((s) => (
                  <StationNode key={s.id} station={s} />
                ))}
              </g>
              <LabelsLayer stations={stations} viewportScale={viewportScale} />
            </svg>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  )
}
