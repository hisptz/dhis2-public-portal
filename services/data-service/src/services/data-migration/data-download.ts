import {
    createDownloadClient,
    createSourceClient,
    dhis2Client,
} from '@/clients/dhis2'
import logger from '@/logging'
import {
    DataServiceAttributeValuesDataItemsSource,
    DataServiceConfig,
    DataServiceDataSourceItemsConfig,
    DataServiceRuntimeConfig,
} from '@packages/shared/schemas'
import { AxiosInstance } from 'axios'
import { chunk, compact, head, isEmpty, uniqBy } from 'lodash'
import { pushToQueue } from '@/rabbit/publisher'
import {
    createMapping,
    fetchPagedData,
    processAttributeComboData,
    processData,
    processDataItems,
    saveDataFile,
} from '@/utils/data'
import { getDimensions } from '@/utils/dimensions'
import { dbClient } from '@/clients/prisma'
import { Queues } from '@/rabbit/constants'
import { DataDownload, DataRun } from '@/generated/prisma/client'
import {
    createDownloadJob,
    createUploadJob,
    updateDownloadStatus,
} from '@/services/data-migration/utils/db'
import { logWorker } from '@/rabbit/utils'
import { categoriesMeta } from '@/variables/meta'
import { getCategoryMetadata } from '@/utils/metadata'
import { Dimensions } from '@/schemas/metadata'
import { handleError, QueuedJobError } from '@/utils/error'
import { fetchMainConfiguration } from '@/services/data-migration/utils/meta'

export interface DataDownloadOptions {
    mainConfigId: string
    dataItemsConfigIds: Array<string>
    runtimeConfig: DataServiceRuntimeConfig
    isDelete?: boolean
}

export async function downloadAndQueueData(
    options: DataDownloadOptions
): Promise<void> {
    try {
        const { mainConfigId, dataItemsConfigIds, runtimeConfig, isDelete } =
            options
        logger.info(
            `Starting data download and queue process for config: ${mainConfigId}`
        )

        const createdRun = await dbClient.dataRun.create({
            data: {
                mainConfigId,
                orgUnitLevel: runtimeConfig.overrides?.orgUnitLevelId,
                periods: runtimeConfig.periods,
                configIds: dataItemsConfigIds,
                timeout: runtimeConfig.timeout,
                isDelete: isDelete,
            },
        })

        const accepted = pushToQueue({
            queue: Queues.DATA_CHUNK,
            reference: createdRun.uid,
        })

        if (!accepted) {
            await dbClient.dataRun.delete({
                where: {
                    id: createdRun.id,
                },
            })
            throw new Error('Could not accept data download job')
        }
    } catch (error) {
        logger.error(
            `Error during download and queue process for config ${options.mainConfigId}:`,
            error
        )
        throw error
    }
}

export async function enqueueDownloadTasks({
    mainConfigId,
    configIds,
    periods,
    uid,
}: DataRun) {
    const mainConfig = await fetchMainConfiguration(mainConfigId)

    const dataItemConfigs = compact(
        configIds.map((id) => {
            return mainConfig.itemsConfig.find(
                ({ id: configId }) => configId === id
            )
        })
    )
    const sourceClient = createSourceClient(mainConfig.source.routeId)

    /**
     * STEP 1:
     * Precompute mapping + expanded data once per config
     */
    const preparedConfigs = await Promise.all(
        dataItemConfigs.map(async (config) => {
            logger.info(
                `Creating mapping for ${config.dataElements.length} data elements in ${config.name}`
            )

            const mapping = await createMapping({
                dataElements: config?.dataElements ?? [],
            })

            logger.info(
                `Processing and disaggregating data elements for ${config.name}`
            )

            const expandedDataItems = await processDataItems({
                mappings: mapping,
                destinationClient: dhis2Client,
                sourceClient,
            })

            logger.info(
                `${config.name} has ${expandedDataItems.length} data items after disaggregation`
            )

            return {
                ...config,
                dataItems: uniqBy(
                    [...(config.dataItems ?? []), ...expandedDataItems],
                    'id'
                ),
            }
        })
    )

    /**
     * STEP 2:
     * Only period-based work left is download
     */
    for (const periodId of periods) {
        await Promise.all(
            preparedConfigs.map((config) =>
                downloadDataPerConfig({
                    config,
                    meta: {
                        periodId,
                        mainConfig,
                        runId: uid,
                        runtimeConfig: {
                            paginateByData: true,
                            pageSize: 1,
                            periods,
                        },
                    },
                })
            )
        )
    }
}

async function downloadDataForDxItems({
    config,
    meta,
}: {
    config: DataServiceDataSourceItemsConfig
    meta: {
        runtimeConfig: DataServiceRuntimeConfig
        mainConfig: DataServiceConfig
        periodId: string
        runId: string
    }
}) {
    try {
        const dimensions = getDimensions({
            runtimeConfig: meta.runtimeConfig,
            mappingConfig: config,
            periodId: meta.periodId,
        })
        const heavyDimension = meta.runtimeConfig.paginateByData
            ? 'dx'
            : Object.keys(dimensions).reduce((acc, value) => {
                  if (
                      (dimensions[acc]?.length ?? 0) >
                      (dimensions[value]?.length ?? 0)
                  )
                      return acc
                  return value
              }, Object.keys(dimensions)[0])
        const pageSize = meta.runtimeConfig.pageSize ?? 50

        if (dimensions[heavyDimension]!.length <= pageSize) {
            logger.info(
                `Heavy dimension is small enough to download all at once`
            )
            const downloadJob = await createDownloadJob({
                dimensions: dimensions,
                config,
                runId: meta.runId,
            })
            pushToQueue({
                queue: Queues.DATA_DOWNLOAD,
                reference: downloadJob.uid,
            })
            return
        }
        logger.info(
            `Done. Heavy dimension is ${heavyDimension}. Data will be fetched by paginating ${heavyDimension} in chunks of ${pageSize}`
        )
        const iterations = chunk(dimensions[heavyDimension], pageSize)
        for (const iteration of iterations) {
            const paginatedDimensions = {
                ...dimensions,
                [heavyDimension]: iteration,
            }
            const downloadJob = await createDownloadJob({
                dimensions: paginatedDimensions,
                config,
                runId: meta.runId,
            })
            pushToQueue({
                queue: Queues.DATA_DOWNLOAD,
                reference: downloadJob.uid,
            })
        }
    } catch (e) {
        if (e instanceof Error) {
            logWorker(
                'error',
                `Could not download data for ${config.id}: ${e.message}`
            )
        }
        throw e
    }
}

async function downloadDataForAttributeItems({
    config,
    meta,
}: {
    config: DataServiceAttributeValuesDataItemsSource
    meta: {
        runtimeConfig: DataServiceRuntimeConfig
        mainConfig: DataServiceConfig
        periodId: string
        runId: string
    }
}) {
    try {
        logger.info(`Getting details for category ${config.attributeId}`)
        categoriesMeta[config.attributeId] = await getCategoryMetadata(
            config.attributeId
        )
        if (!categoriesMeta[config.attributeId]) {
            logger.error(`Could not get metadata for ${config.attributeId}`)
            throw Error(`Could not get metadata for ${config.attributeId}`)
        }
        logger.info(`Details retrieved for category ${config.attributeId}`)
        const dimensions = getDimensions({
            runtimeConfig: meta.runtimeConfig,
            mappingConfig: config,
            periodId: meta.periodId,
        })
        const heavyDimension = meta.runtimeConfig.paginateByData
            ? 'dx'
            : Object.keys(dimensions).reduce((acc, value) => {
                  if (
                      (dimensions[acc]?.length ?? 0) >
                      (dimensions[value]?.length ?? 0)
                  )
                      return acc
                  return value
              }, Object.keys(dimensions)[0])
        const pageSize = meta.runtimeConfig.pageSize ?? 50
        const categoryOptions = config.attributeOptions
        const iterations = chunk(dimensions[heavyDimension], pageSize)

        logger.info(
            `Expected iterations ${iterations.length} for ${heavyDimension} with ${categoryOptions.length} options`
        )
        for (const categoryOption of categoryOptions) {
            logger.info(`Downloading data for ${categoryOption}`)
            for (const iteration of iterations) {
                const paginatedDimensions = {
                    ...dimensions,
                    [heavyDimension]: iteration,
                }
                logger.info(
                    `Downloading data for dimensions ${JSON.stringify(paginatedDimensions)} and filter ${JSON.stringify(
                        {
                            [config.attributeId]: [categoryOption],
                        }
                    )}`
                )
                const downloadJob = await createDownloadJob({
                    dimensions: paginatedDimensions,
                    config,
                    filters: {
                        [config.attributeId]: [categoryOption],
                    },
                    runId: meta.runId,
                })
                pushToQueue({
                    queue: Queues.DATA_DOWNLOAD,
                    reference: downloadJob.uid,
                })
            }
        }
    } catch (e) {
        if (e instanceof Error) {
            logger.error(
                `Could not download data for ${config.id}: ${e.message}`
            )
        }
        throw e
    }
}

export async function downloadDataPerConfig({
    config,
    meta,
}: {
    config: DataServiceDataSourceItemsConfig
    meta: {
        runtimeConfig: DataServiceRuntimeConfig
        mainConfig: DataServiceConfig
        periodId: string
        runId: string
    }
}) {
    switch (config.type) {
        case 'ATTRIBUTE_VALUES':
            return downloadDataForAttributeItems({ config, meta })
        case 'DX_VALUES':
            return downloadDataForDxItems({ config, meta })
    }
}
export async function downloadData(
    dataDownloadTask: DataDownload & { run: DataRun }
): Promise<void> {
    try {
        const { run, configId } = dataDownloadTask
        const mainConfigForClient = await fetchMainConfiguration(
            run.mainConfigId
        )
        const config = mainConfigForClient.itemsConfig.find(
            ({ id }) => id === configId
        )

        if (!config) {
            throw new QueuedJobError(
                `Config ${configId} not found for run ${run.id}`,
                false
            )
        }

        const client = run.isDelete
            ? dhis2Client
            : createDownloadClient({ config: mainConfigForClient })

        await processDataDownload({
            client,
            timeout: run.timeout,
            config,
            task: dataDownloadTask,
        })
    } catch (error) {
        if (error instanceof Error) {
            handleError(error)
        }
    }
}

async function processDataDownload({
    client,
    timeout,
    config,
    task,
}: {
    client: AxiosInstance
    timeout?: number | null
    config: DataServiceDataSourceItemsConfig
    task: DataDownload & { run: DataRun }
}): Promise<void> {
    const dimensions = task.dimensions as Dimensions
    const filters = (task.filters as Dimensions | null) ?? undefined
    try {
        const data = await fetchPagedData({
            dimensions,
            filters,
            client,
            timeout: timeout ?? 300000,
        })

        if (!data || isEmpty(data.dataValues)) {
            logger.info(
                `No data found for ${config.id}: ${JSON.stringify(dimensions.dx?.slice(0, 5) || 'no dx')}`
            )
            return
        }

        const processedData =
            config.type === 'ATTRIBUTE_VALUES'
                ? await processAttributeComboData({
                      data,
                      dataItemsConfig: config,
                      categoryOptionId: head(
                          filters![
                              (
                                  config as DataServiceAttributeValuesDataItemsSource
                              ).attributeId
                          ]
                      ) as string,
                  })
                : await processData({
                      data,
                      dataItems: config.dataItems,
                  })

        logger.info(`${processedData.dataValues.length} data values processed`)

        if (!isEmpty(processedData.dataValues)) {
            const filename = await saveDataFile({
                data: processedData.dataValues,
                itemsConfig: config,
            })

            await updateDownloadStatus(task.uid, {
                count: processedData.dataValues.length,
            })

            const createdUploadTask = await createUploadJob({
                filename,
                runId: task.runId,
                downloadId: task.id,
                isDelete: task.run.isDelete,
            })
            pushToQueue({
                queue: Queues.DATA_UPLOAD,
                reference: createdUploadTask.uid,
            })
        }
    } catch (error) {
        if (error instanceof QueuedJobError) {
            throw error
        }
        if (error instanceof Error) {
            throw new QueuedJobError(error.message, false)
        } else {
            throw new QueuedJobError('Unknown error', false)
        }
    }
}
