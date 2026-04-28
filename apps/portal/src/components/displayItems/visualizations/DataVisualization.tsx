import { ReadonlyURLSearchParams } from 'next/navigation'
import { dhis2HttpClient } from '@/utils/api/dhis2'
import {
    ChartVisualizationItem,
    VisualizationConfig,
    visualizationFields,
} from '@packages/shared/schemas'
import { getAppearanceConfig } from '@/utils/config/appConfig'
import { DataVisualizationClient } from './DataVisualizationClient'

export interface MainVisualizationProps {
    searchParams?: ReadonlyURLSearchParams
    config: ChartVisualizationItem
    showFilter?: boolean
    disableActions?: boolean
}

export async function getDataVisualization(config: ChartVisualizationItem) {
    const { id } = config
    const visualizationConfig = await dhis2HttpClient.get<VisualizationConfig>(
        `visualizations/${id}`,
        {
            params: {
                fields: visualizationFields.join(','),
            },
        }
    )

    return {
        visualizationConfig,
    }
}

export async function DataVisualization({
    config,
    disableActions,
    showFilter,
}: MainVisualizationProps) {
    const { visualizationConfig } = await getDataVisualization(config)
    const { appearanceConfig } = (await getAppearanceConfig())!
    const colors = appearanceConfig.colors.chartColors

    if (!visualizationConfig) {
        console.error(
            `Could not get visualization details for visualization ${config.id}`
        )
        throw Error('Could not get visualization details')
    }

    return (
        <DataVisualizationClient
            visualizationConfig={visualizationConfig}
            config={config}
            colors={colors}
            disableActions={disableActions}
            showFilter={showFilter}
        />
    )
}
