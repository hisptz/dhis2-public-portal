import logger from '@/logging'
import * as _ from 'lodash'
import { compact, flattenDeep, isEmpty } from 'lodash'
import { AxiosInstance } from 'axios'
import { logWorker } from '@/rabbit/utils'

export type Visualization = {
    id: string
    type: string
    dataDimensionItems: Array<{
        dataDimensionItemType: string
        reportingRate?: { id: string }
        indicator?: { id: string }
        dataElement?: { id: string }
        programIndicator?: { id: string }
        programDataElement?: { id: string }
        programAttribute?: { id: string }
    }>
}

export type D2Map = {
    id: string
    mapViews: Array<{
        dataDimensionItems: Array<{
            dataDimensionItemType: string
            reportingRate?: { id: string }
            indicator?: { id: string }
            dataElement?: { id: string }
            programIndicator?: { id: string }
            programDataElement?: { id: string }
            programAttribute?: { id: string }
        }>
    }>
}

export type DataElement = {
    id: string
    code: string
    shortName: string
    name: string
    valueType: string
    categoryCombo: {
        id: string
        category?: { id: string }
    }
    aggregationType: string
    legendSets: Array<{ id: string }>
}

export async function getVisualizationConfigs({
    items,
    client,
}: {
    items: string[]
    client: AxiosInstance
}) {
    if (isEmpty(items)) {
        logger.warn('No visualizations provided — skipping fetch')
        return []
    }
    logWorker(
        'info',
        `Fetching configurations for ${items.length} visualizations...`
    )
    const response = await client.get<{
        visualizations: Visualization[]
    }>(`visualizations`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        },
    })
    logWorker(
        'info',
        `Fetched configurations for ${items.length} visualizations`
    )
    return response.data.visualizations
}

export async function getMapsConfig({
    items,
    client,
}: {
    items: string[]
    client: AxiosInstance
}) {
    if (isEmpty(items)) {
        logger.warn('No maps provided — skipping fetch')
        return []
    }
    logWorker('info', `Fetching configurations for ${items.length} maps`)
    const response = await client.get<{
        maps: Array<D2Map>
    }>(`maps`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        },
    })
    logWorker('info', `Fetched configurations for ${items.length} maps`)
    return response.data.maps
}

export function getIndicatorIdsFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return compact(
        flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { indicator?: { id: string } }) => item.indicator?.id
                )
            )
        )
    )
}

export function getDataElementIdsFromMaps(mapsConfig: D2Map[]) {
    return _.compact(
        _.flattenDeep(
            mapsConfig.map((config) =>
                config.mapViews.map((view) =>
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
    visualizationConfigs: Visualization[]
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

export function getProgramIndicatorsFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { programIndicator?: { id: string } }) =>
                        item.programIndicator?.id
                )
            )
        )
    )
}

/*
 * We get the data set ids as we are going to pull all reporting rates regardless of what reporting rate is actually used in the visualization
 * */
export function getDataSetsFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { reportingRate?: { id: string } }) =>
                        item.reportingRate?.id.split('.')[0]
                )
            )
        )
    )
}

export function getProgramAttributesFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { programAttribute?: { id: string } }) =>
                        item.programAttribute?.id
                )
            )
        )
    )
}

export function getProgramDataElementFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { programDataElement?: { id: string } }) =>
                        item.programDataElement?.id
                )
            )
        )
    )
}

export function getProgramIndicatorsFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map(
                        (item) => item.programIndicator?.id
                    )
                )
            )
        )
    )
}

export function getDataSetsFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map(
                        (item) => item.reportingRate?.id.split('.')[0]
                    )
                )
            )
        )
    )
}

export function getProgramAttributesFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map(
                        (item) => item.programAttribute?.id
                    )
                )
            )
        )
    )
}

export function getProgramDataElementFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map(
                        (item) => item.programDataElement?.id
                    )
                )
            )
        )
    )
}

export function getIndicatorIdsFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map((item) => item.indicator?.id)
                )
            )
        )
    )
}

export async function getDataElementConfigs({
    items,
    client,
}: {
    client: AxiosInstance
    items: string[]
}) {
    logger.info(
        `getDataElementConfigs called with ${items.length} data element IDs`
    )

    if (isEmpty(items)) {
        logger.warn('No data element IDs provided — skipping fetch')
        return []
    }

    const response = await client.get<{
        dataElements: Array<DataElement>
    }>(`dataElements`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryCombo[id,category[id]]',
            paging: false,
        },
    })

    return response.data.dataElements
}

export function sanitizeVisualizationsWithDatasetReferences({
    visualizations,
    datasetDataElements,
}: {
    visualizations: Array<Visualization>
    datasetDataElements: Array<DataElement>
}): Array<Visualization> {
    return visualizations.map((visualization) => {
        const hasDatasetReference = visualization.dataDimensionItems.some(
            (item) => {
                return !!item.reportingRate?.id
            }
        )
        if (hasDatasetReference) {
            const updatedDataDimensionItems =
                visualization.dataDimensionItems.map((item) => {
                    if (item.reportingRate?.id) {
                        const datasetDataElement = datasetDataElements.find(
                            (dataElement) =>
                                dataElement.id === item.reportingRate?.id
                        )
                        return {
                            ...item,
                            reportingRate: undefined,
                            dataDimensionItemType: 'DATA_ELEMENT',
                            dataElement: {
                                id: datasetDataElement!.id,
                            },
                        }
                    }
                    return item
                })
            return {
                ...visualization,
                dataDimensionItems: updatedDataDimensionItems,
            }
        } else {
            return visualization
        }
    })
}
export function sanitizeMapsWithDatasetReferences({
    maps,
    datasetDataElements,
}: {
    maps: Array<D2Map>
    datasetDataElements: Array<DataElement>
}): Array<D2Map> {
    return maps.map((map) => {
        const hasDatasetReference = map.mapViews.map((view) =>
            view.dataDimensionItems.some((item) => {
                return !!item.reportingRate?.id
            })
        )
        if (hasDatasetReference) {
            const updatedMapViews = map.mapViews.map((view) => {
                const hasDatasetReference = view.dataDimensionItems.some(
                    (item) => !!item.reportingRate
                )
                if (hasDatasetReference) {
                    const updatedDataDimensionItems =
                        view.dataDimensionItems.map((item) => {
                            if (item.reportingRate?.id) {
                                const datasetDataElement =
                                    datasetDataElements.find(
                                        (dataElement) =>
                                            dataElement.id ===
                                            item.reportingRate?.id
                                    )
                                return {
                                    ...item,
                                    reportingRate: undefined,
                                    dataDimensionItemType: 'DATA_ELEMENT',
                                    dataElement: {
                                        id:
                                            datasetDataElement?.id ??
                                            item.reportingRate.id,
                                    },
                                }
                            }
                            return item
                        })

                    return {
                        ...view,
                        dataDimensionItems: updatedDataDimensionItems,
                    }
                }
                return view
            })
            return {
                ...map,
                mapViews: updatedMapViews,
            }
        } else {
            return map
        }
    })
}
