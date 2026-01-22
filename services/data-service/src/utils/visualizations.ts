import { createSourceClient, dhis2Client } from '@/clients/dhis2'
import logger from '@/logging'
import * as _ from 'lodash'
import { fetchItemsInParallel } from './parallel-fetch'
import { AppModule, ModuleType } from '@packages/shared/schemas'

export { fetchItemsInParallel }

enum DisplayItemType {
    RICH_TEXT = 'RICH_TEXT',
    VISUALIZATION = 'VISUALIZATION',
    HIGHLIGHTED_SINGLE_VALUE = 'HIGHLIGHTED_SINGLE_VALUE',
    FEEDBACK = 'FEEDBACK',
    SECTION = 'SECTION',
}

export enum VisualizationDisplayItemType {
    CHART = 'CHART',
    MAP = 'MAP',
    BANNER = 'BANNER',
}

type Visualization = {
    id: string
    type: string
}

export async function getModuleConfigs(routeId?: string) {
    try {
        const client = routeId ? await createSourceClient(routeId) : dhis2Client
        const url = `dataStore/hisptz-public-portal-modules`
        const response = await client.get<Array<string>>(url)
        const moduleIds = response.data ?? []
        const moduleConfigs = []
        for (const moduleId of moduleIds) {
            const moduleUrl = `dataStore/hisptz-public-portal-modules/${moduleId}`
            const moduleResponse = await client.get<AppModule>(moduleUrl)

            if (!moduleResponse.data || !moduleResponse.data.config) {
                console.warn(
                    `Module config for ${moduleId} is empty or undefined`
                )
                continue
            }
            if (moduleResponse.data.type == ModuleType.VISUALIZATION) {
                if (moduleResponse.data.config.grouped) {
                    for (const group of moduleResponse.data.config.groups ||
                        []) {
                        if (group.items && Array.isArray(group.items)) {
                            moduleConfigs.push(
                                ...group.items.map((item) => item.item)
                            )
                        }
                    }
                } else {
                    if (
                        moduleResponse.data.config.items &&
                        Array.isArray(moduleResponse.data.config.items)
                    ) {
                        moduleConfigs.push(
                            ...moduleResponse.data.config.items.map(
                                (item) => item.item
                            )
                        )
                    }
                }
            }
            if (moduleResponse.data.type == ModuleType.SECTION) {
                for (const section of moduleResponse.data.config.sections ||
                    []) {
                    if (
                        section.type == 'SINGLE_ITEM' &&
                        section.item &&
                        (section.item.type == DisplayItemType.VISUALIZATION ||
                            section.item.type ==
                                DisplayItemType.HIGHLIGHTED_SINGLE_VALUE)
                    ) {
                        moduleConfigs.push(section.item.item)
                    } else {
                        if (
                            section.type != 'SINGLE_ITEM' &&
                            section.items &&
                            Array.isArray(section.items)
                        ) {
                            moduleConfigs.push(
                                ...section.items.map((item) => item.item)
                            )
                        }
                    }
                }
            }
        }
        return (
            moduleConfigs.flat().filter((config) => config != undefined) ?? []
        )
    } catch (e) {
        console.error(e)
    }
}

export function getVisualizations(
    moduleConfigs: { id: string; type: VisualizationDisplayItemType }[]
) {
    const visualizations = []
    visualizations.push(
        ...(moduleConfigs?.filter(
            (module) => module.type != VisualizationDisplayItemType.MAP
        ) ?? [])
    )
    return visualizations
}

export function getMaps(
    moduleConfigs: { id: string; type: VisualizationDisplayItemType }[]
) {
    const maps = []
    maps.push(
        ...(moduleConfigs?.filter(
            (module) => module.type == VisualizationDisplayItemType.MAP
        ) ?? [])
    )
    return maps
}

export async function getVisualizationConfigs(
    visualizations: { id: string }[],
    routeId?: string
) {
    const client = routeId ? await createSourceClient(routeId) : dhis2Client

    if (!visualizations || visualizations.length === 0) {
        logger.warn('No visualizations provided — skipping fetch')
        return []
    }

    logger.info(
        `Fetching configurations for ${visualizations.length} visualizations`
    )

    const visualizationIds = visualizations.map((vis) => vis.id)

    const allVisualizations = await fetchItemsInParallel(
        client,
        'visualizations',
        visualizationIds,
        ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        5
    )

    logger.info(
        `getVisualizationConfigs completed: ${allVisualizations.length} total visualizations fetched`
    )
    return allVisualizations
}

export async function getMapsConfig(maps: Visualization[], routeId?: string) {
    const client = routeId ? await createSourceClient(routeId) : dhis2Client

    if (!maps || maps.length === 0) {
        logger.warn('No maps provided — skipping fetch')
        return []
    }

    logger.info(`Fetching configurations for ${maps.length} maps`)

    const mapIds = maps.map((map) => map.id)

    const allMaps = await fetchItemsInParallel(
        client,
        'maps',
        mapIds,
        ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        5
    )

    logger.info(`getMapsConfig completed: ${allMaps.length} total maps fetched`)
    return allMaps
}

export function getIndicatorIdsFromVisualizations(visualizationConfigs: any[]) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { indicator?: { id: string } }) => item.indicator?.id
                )
            )
        )
    )
}

export function getIndicatorIdsFromMaps(mapsConfig: any[]) {
    return _.compact(
        _.flattenDeep(
            mapsConfig.map((config) =>
                config.mapViews.map((view: any) =>
                    view.dataDimensionItems.map(
                        (item: { indicator?: { id: string } }) =>
                            item.indicator?.id
                    )
                )
            )
        )
    )
}

export async function getIndicatorConfigs(
    indicatorIds: string[],
    routeId: string
) {
    const client = await createSourceClient(routeId)
    if (!indicatorIds || indicatorIds.length === 0) {
        logger.warn('No indicator IDs provided — skipping fetch')
        return []
    }

    logger.info(`Fetching configurations for ${indicatorIds.length} indicators`)

    const indicators = await fetchItemsInParallel(
        client,
        'indicators',
        indicatorIds,
        ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        5
    )

    const processedIndicators = indicators.map((indicator: any) => ({
        ...indicator,
        translations: [],
    }))

    logger.info(
        `getIndicatorConfigs completed: ${processedIndicators.length} total indicators fetched`
    )
    return processedIndicators
}

export function getDataElementIdsFromMaps(mapsConfig: any[]) {
    return _.compact(
        _.flattenDeep(
            mapsConfig.map((config) =>
                config.mapViews.map((view: any) =>
                    view.dataDimensionItems.map(
                        (item: { dataElement?: { id: string } }) =>
                            item.dataElement?.id
                    )
                )
            )
        )
    )
}

export function getDataElementIdsFromVisualizations(
    visualizationConfigs: any[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { dataElement?: { id: string } }) =>
                        item.dataElement?.id
                )
            )
        )
    )
}

export async function getDataElementConfigs(
    dataElementIds: string[],
    routeId?: string
) {
    const client = routeId ? await createSourceClient(routeId) : dhis2Client
    logger.info(
        `getDataElementConfigs called with ${dataElementIds.length} data element IDs`,
        {
            dataElementIds: dataElementIds.slice(0, 10),
            totalCount: dataElementIds.length,
            routeId,
        }
    )

    if (!dataElementIds || dataElementIds.length === 0) {
        logger.warn('No data element IDs provided — skipping fetch')
        return []
    }

    const dataElements = await fetchItemsInParallel(
        client,
        'dataElements',
        dataElementIds,
        ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        5
    )

    const processedDataElements = dataElements.map((dataElement: any) => ({
        ...dataElement,
        translations: [],
    }))

    logger.info(
        `getDataElementConfigs completed: ${processedDataElements.length} total data elements fetched`
    )
    return processedDataElements
}
