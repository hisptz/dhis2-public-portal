import {
    D2Map,
    DataElement,
    getDataElementConfigs,
    getDataElementIdsFromMaps,
    getDataElementIdsFromVisualizations,
    getDataSetsFromMaps,
    getDataSetsFromVisualizations,
    getIndicatorIdsFromMaps,
    getIndicatorIdsFromVisualizations,
    getMapsConfig,
    getProgramAttributesFromMaps,
    getProgramAttributesFromVisualizations,
    getProgramDataElementFromMaps,
    getProgramDataElementFromVisualizations,
    getProgramIndicatorsFromMaps,
    getProgramIndicatorsFromVisualizations,
    getVisualizationConfigs,
    sanitizeMapsWithDatasetReferences,
    sanitizeVisualizationsWithDatasetReferences,
    Visualization,
} from '@/utils/visualizations'
import { flattenDeep, isEmpty, uniq, uniqBy } from 'lodash'
import {
    getCategories,
    getIndicatorsConfig,
    getIndicatorsSources,
    getIndicatorTypes,
    sanitizeIndicatorsWithDatasetReferences,
} from '@/utils/indicators'
import logger from '@/logging'
import {
    getDefaultCategoryValues,
    getDestinationDefaultCategoryValues,
} from '@/utils/default-categories'
import { DataItemMapping } from '@/utils/data-item-mapping'
import {
    MetadataDownload,
    MetadataDownloadType,
    MetadataRun,
    ProcessStatus,
} from '@/generated/prisma/client'
import { createSourceClient } from '@/clients/dhis2'
import { AxiosInstance } from 'axios'
import {
    generateDataElementsForProgramItems,
    getProgramAttributesConfig,
    getProgramDataElementsConfig,
    getProgramIndicatorsConfig,
} from '@/utils/program-metadata'
import {
    generateDataElementsForDatasetItems,
    getDatasetsConfig,
} from '@/utils/dataset-metadata'
import { saveMetadataFile } from '@/services/metadata-migration/utils/file'
import { dbClient } from '@/clients/prisma'
import { pushToQueue } from '@/rabbit/publisher'
import { Queues } from '@/rabbit/constants'

export interface ProcessedMetadata {
    metadata: {
        legendSets: Array<LegendSet>
        visualizations: Array<Visualization>
        maps: Array<D2Map>
        indicators: Array<{
            id: string
        }>
        dataElements: Array<{
            id: string
        }>
        indicatorTypes: Array<{
            id: string
        }>
        categories: Array<{
            id: string
        }>
        categoryCombos: Array<{
            id: string
        }>
        categoryOptions: Array<{
            id: string
        }>
        categoryOptionCombos: Array<{
            id: string
        }>
    }
    mapping: Array<DataItemMapping>
}

type LegendSet = {
    id: string
    name: string
    legends: Array<{
        id: string
        name: string
        color: string
    }>
}

export async function downloadAndQueueMetadata({
    task,
}: {
    task: MetadataDownload & { run: MetadataRun }
}): Promise<void> {
    const metadata = await downloadMetadata(task)
    if (!metadata) {
        await dbClient.metadataDownload.update({
            where: { uid: task.uid },
            data: {
                status: ProcessStatus.FAILED,
                error: 'Unsupported metadata download',
            },
        })
        return
    }
    const filename = await saveMetadataFile({
        data: metadata,
    })
    const createdUploadTask = await dbClient.metadataUpload.create({
        data: {
            filename,
            downloadId: task.id,
            runId: task.run.id,
        },
    })
    pushToQueue({
        queue: Queues.METADATA_UPLOAD,
        reference: createdUploadTask.uid,
    })
    await dbClient.metadataDownload.update({
        where: { uid: task.uid },
        data: {
            status: ProcessStatus.DONE,
        },
    })
}

function extractLegendSets(
    items: Array<{
        legendSets: Array<{
            id: string
        }>
    }>
) {
    const legendSets = items.flatMap((item) => item.legendSets)
    return uniq(legendSets.map((legendSet) => legendSet.id))
}

async function getLegendSets({
    items,
    client,
}: {
    items: string[]
    client: AxiosInstance
}) {
    const response = await client.get<{
        legendSets: Array<LegendSet>
    }>(`legendSets`, {
        params: {
            fields: ':owner,legends[:owner,!sharing,!users,!userGroups],!users,!userGroups,!sharing',
            filter: `id:in:[${items.join(',')}]`,
            paging: false,
        },
    })

    return response.data.legendSets
}

function generateDataItemsMapping({
    dataElements,
    datasetDataElements,
    defaultCategoryComboId,
    categoryCombos,
}: {
    dataElements: Array<DataElement>
    datasetDataElements: Array<DataElement>
    categoryCombos: Array<{
        id: string
        categoryOptionCombos: Array<{ id: string }>
    }>
    defaultCategoryComboId?: string
}): Array<DataItemMapping> {
    const dataElementDataItems = flattenDeep(
        dataElements.map((dataElement) => {
            if (dataElement.categoryCombo.id === defaultCategoryComboId) {
                return {
                    id: dataElement.id,
                    sourceId: dataElement.id,
                }
            } else {
                const categoryCombo = categoryCombos.find(
                    ({ id }) => id === dataElement.categoryCombo.id
                )

                return (
                    categoryCombo?.categoryOptionCombos.map(
                        (categoryOptionCombo) => ({
                            id: `${dataElement.id}.${categoryOptionCombo.id}`,
                            sourceId: `${dataElement.id}.${categoryOptionCombo.id}`,
                        })
                    ) ?? []
                )
            }
        })
    )
    const datasetDataItems = datasetDataElements.map((dataElement) => ({
        id: dataElement.id,
        sourceId: dataElement.code,
    }))

    return uniqBy([...dataElementDataItems, ...datasetDataItems], 'id')
}

function extractCategories(
    items: Array<{ categoryCombo: { id: string; category?: { id: string } } }>,
    sourceDefaultCategoryId: string
) {
    return uniq(items.map((item) => item.categoryCombo.category!.id)).filter(
        (comboId) => comboId !== sourceDefaultCategoryId
    )
}

function replaceDefaultCategoryCombo({
    dataElements,
    defaultDestinationCategoryCombo,
    defaultSourceCategoryCombo,
}: {
    dataElements: Array<DataElement>
    defaultSourceCategoryCombo: string
    defaultDestinationCategoryCombo: string
}) {
    return dataElements.map((dataElement) => {
        if (dataElement.categoryCombo.id === defaultSourceCategoryCombo) {
            return {
                ...dataElement,
                categoryCombo: {
                    id: defaultDestinationCategoryCombo,
                },
            }
        }
        return dataElement
    })
}

export async function downloadMetadata(
    task: MetadataDownload & { run: MetadataRun }
): Promise<ProcessedMetadata | null> {
    try {
        logger.info('Fetching default category system values...')
        const client = createSourceClient(task.run.mainConfigId)
        const sourceDefaults = await getDefaultCategoryValues(client)
        const destinationDefaults = await getDestinationDefaultCategoryValues()

        if (task.type === MetadataDownloadType.DASHBOARD) {
            //Will be worked on soon
            return null
        }

        const indicatorIds = []
        const dataElementIds = []
        const programIndicatorIds = []
        const programAttributeIds = []
        const programDataElementsIds = []
        const dataSetIds = []
        const visualizations = await getVisualizationConfigs({
            items: task.items,
            client,
        })
        const maps = await getMapsConfig({
            items: task.items,
            client,
        })

        if (!isEmpty(visualizations)) {
            indicatorIds.push(
                ...getIndicatorIdsFromVisualizations(visualizations)
            )
            dataElementIds.push(
                ...getDataElementIdsFromVisualizations(visualizations)
            )
            programAttributeIds.push(
                ...getProgramAttributesFromVisualizations(visualizations)
            )
            programIndicatorIds.push(
                ...getProgramIndicatorsFromVisualizations(visualizations)
            )
            programDataElementsIds.push(
                ...getProgramDataElementFromVisualizations(visualizations)
            )
            dataSetIds.push(...getDataSetsFromVisualizations(visualizations))
        }

        if (!isEmpty(maps)) {
            indicatorIds.push(...getIndicatorIdsFromMaps(maps))
            dataElementIds.push(...getDataElementIdsFromMaps(maps))
            programAttributeIds.push(...getProgramAttributesFromMaps(maps))
            programIndicatorIds.push(...getProgramIndicatorsFromMaps(maps))
            dataSetIds.push(...getDataSetsFromMaps(maps))
            programDataElementsIds.push(...getProgramDataElementFromMaps(maps))
        }

        const indicators = await getIndicatorsConfig({
            items: uniq(indicatorIds),
            client,
        })
        if (!isEmpty(indicatorIds)) {
            //We need to get all other meta used in the indicators expressions
            const indicatorSources = await getIndicatorsSources({
                indicators,
            })
            dataElementIds.push(...indicatorSources.dataElementIds)
            programIndicatorIds.push(...indicatorSources.programIndicatorIds)
            dataSetIds.push(...indicatorSources.dataSetIds)
        }
        const dataElements = await getDataElementConfigs({
            items: uniq(dataElementIds),
            client,
        })
        const programIndicators = await getProgramIndicatorsConfig({
            items: uniq(programIndicatorIds),
            client,
        })
        const programAttributes = await getProgramAttributesConfig({
            items: uniq(programAttributeIds),
            client,
        })
        const programDataElements = await getProgramDataElementsConfig({
            items: uniq(programDataElementsIds),
            client,
        })
        const dataSets = await getDatasetsConfig({
            client,
            items: uniq(dataSetIds),
        })
        const createdProgramDataElements = generateDataElementsForProgramItems(
            [
                ...programDataElements,
                ...programAttributes,
                ...programIndicators,
            ],
            destinationDefaults.defaultCategoryComboId
        )
        const createdDataSetDataElements = generateDataElementsForDatasetItems(
            dataSets,
            destinationDefaults.defaultCategoryComboId
        )
        const legendSetIds = extractLegendSets([
            ...indicators,
            ...dataElements,
            ...createdProgramDataElements,
            ...createdDataSetDataElements,
        ])
        const legendSets = await getLegendSets({
            client,
            items: legendSetIds,
        })
        const categoryIds = extractCategories(
            dataElements,
            sourceDefaults.defaultCategoryId
        )
        const {
            categories,
            categoryOptions,
            categoryCombos,
            categoryOptionCombos,
        } = await getCategories({
            items: uniq(categoryIds),
            client,
        })
        const indicatorTypeIds = uniq(
            indicators.map((indicator) => indicator.indicatorType.id)
        )
        const indicatorTypes = await getIndicatorTypes({
            items: indicatorTypeIds,
            client,
        })
        const sanitizedIndicators = sanitizeIndicatorsWithDatasetReferences({
            indicators,
            datasetDataElements: createdDataSetDataElements,
        })

        const sanitizedVisualizations =
            sanitizeVisualizationsWithDatasetReferences({
                visualizations,
                datasetDataElements: createdDataSetDataElements,
            })

        const sanitizedMaps = sanitizeMapsWithDatasetReferences({
            maps,
            datasetDataElements: createdDataSetDataElements,
        })
        const dataElementsWithReplacedCategoryCombo =
            replaceDefaultCategoryCombo({
                dataElements,
                defaultSourceCategoryCombo:
                    sourceDefaults.defaultCategoryComboId,
                defaultDestinationCategoryCombo:
                    destinationDefaults.defaultCategoryComboId,
            })
        const sanitizedDataElements = uniqBy(
            [
                ...dataElementsWithReplacedCategoryCombo,
                ...createdProgramDataElements,
                ...createdDataSetDataElements,
            ],
            'id'
        )

        const dataItemsMapping = generateDataItemsMapping({
            dataElements: sanitizedDataElements,
            datasetDataElements: createdDataSetDataElements,
            categoryCombos: categoryCombos,
        })

        return {
            metadata: {
                maps: sanitizedMaps,
                visualizations: sanitizedVisualizations,
                indicators: sanitizedIndicators,
                indicatorTypes,
                dataElements: sanitizedDataElements,
                categories,
                categoryOptions,
                categoryCombos,
                categoryOptionCombos,
                legendSets,
            },
            mapping: dataItemsMapping,
        }
    } catch (error) {
        logger.error('Error during metadata download:', error)
        throw error
    }
}
