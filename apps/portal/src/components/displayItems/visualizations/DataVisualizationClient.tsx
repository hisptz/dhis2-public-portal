'use client'

import dynamic from 'next/dynamic'
import {
    ChartVisualizationItem,
    VisualizationChartType,
    VisualizationConfig,
    YearOverYearVisualizationConfig,
} from '@packages/shared/schemas'

const DataVisComponent = dynamic(
    () =>
        import('./DataVisComponent').then((m) => ({
            default: m.DataVisComponent,
        })),
    { ssr: false }
)

const YearOverYearDataVisComponent = dynamic(
    () =>
        import('./YearOverYearDataVisComponent').then((m) => ({
            default: m.YearOverYearDataVisComponent,
        })),
    { ssr: false }
)

export function DataVisualizationClient({
    visualizationConfig,
    config,
    colors,
    disableActions,
    showFilter,
}: {
    visualizationConfig: VisualizationConfig
    config: ChartVisualizationItem
    colors: string[]
    disableActions?: boolean
    showFilter?: boolean
}) {
    if (
        [
            VisualizationChartType.YEAR_OVER_YEAR_COLUMN,
            VisualizationChartType.YEAR_OVER_YEAR_LINE,
        ].includes(visualizationConfig.type)
    ) {
        return (
            <YearOverYearDataVisComponent
                colors={colors}
                disableActions={disableActions}
                config={config}
                showFilter={showFilter}
                visualizationConfig={
                    visualizationConfig as YearOverYearVisualizationConfig
                }
            />
        )
    }

    return (
        <DataVisComponent
            showFilter={showFilter}
            colors={colors}
            disableActions={disableActions}
            config={config}
            visualizationConfig={visualizationConfig}
        />
    )
}
