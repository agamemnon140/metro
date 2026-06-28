import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch'
import { drawnLines, drawnStations } from '@/lib/network'
import { viewBoxFor } from '@/lib/coords'
import { useZoom } from '@/hooks/useZoomLevel'
import { useSelection } from '@/hooks/useSelection'
import { useViewMode } from '@/hooks/useViewMode'
import { useLayers } from '@/hooks/useLayers'
import { LinePath } from './LinePath'
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
  const { width, height } = viewBoxFor(mode)

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
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="100%"
              role="img"
              aria-label="Diagrama da rede metroferroviária de São Paulo"
              onClick={() => clear()}
            >
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
              <LabelsLayer stations={stations} />
            </svg>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  )
}
