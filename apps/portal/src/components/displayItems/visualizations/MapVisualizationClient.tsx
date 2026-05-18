'use client'

import dynamic from 'next/dynamic'
import { ChartVisualizationItem, MapConfig } from '@packages/shared/schemas'

const MapVisComponent = dynamic(
    () =>
        import('./MapVisComponent').then((m) => ({
            default: m.MapVisComponent,
        })),
    { ssr: false }
)

export function MapVisualizationClient({
    mapConfig,
    config,
    showFilter,
    disableActions,
}: {
    mapConfig: MapConfig
    config: ChartVisualizationItem
    showFilter?: boolean
    disableActions?: boolean
}) {
    return (
        <MapVisComponent
            showFilter={showFilter}
            disableActions={disableActions}
            mapConfig={mapConfig}
            config={config}
        />
    )
}
