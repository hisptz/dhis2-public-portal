import { MetadataDownloadType, MetadataRun } from '@/generated/prisma/client'
import { chunk, isEmpty } from 'lodash'
import { dbClient } from '@/clients/prisma'
import logger from '@/logging'
import { pushToQueue } from '@/rabbit/publisher'
import { Queues } from '@/rabbit/constants'

const MAX_PAGE_SIZE = 10

async function createDownloadJobs({
    type,
    items,
    runId,
}: {
    type: MetadataDownloadType
    items: string[]
    runId: number
}) {
    if (!isEmpty(items)) {
        if (items.length > MAX_PAGE_SIZE) {
            const chunkedItems = chunk(items, MAX_PAGE_SIZE)
            const createdItems =
                await dbClient.metadataDownload.createManyAndReturn({
                    data: chunkedItems.map((items) => {
                        return {
                            runId,
                            items,
                            type,
                        }
                    }),
                })
            return createdItems.map(({ uid }) => uid)
        } else {
            const createdItem = await dbClient.metadataDownload.create({
                data: {
                    runId,
                    items,
                    type,
                },
            })
            return [createdItem.uid]
        }
    }
    return []
}

export async function processMetadataDownload({
    metadataRun,
}: {
    metadataRun: MetadataRun
}) {
    const items: string[] = []
    logger.info(`Processing metadata download for run ${metadataRun.id}`)
    logger.info(`Processing visualizations for run ${metadataRun.id}...`)
    items.push(
        ...(await createDownloadJobs({
            type: MetadataDownloadType.VISUALIZATION,
            items: metadataRun.visualizations,
            runId: metadataRun.id,
        }))
    )
    logger.info(`Finished processing visualizations for run ${metadataRun.id}`)
    logger.info(`Processing maps for run ${metadataRun.id}...`)
    items.push(
        ...(await createDownloadJobs({
            type: MetadataDownloadType.MAP,
            items: metadataRun.maps,
            runId: metadataRun.id,
        }))
    )
    logger.info(`Finished processing maps for run ${metadataRun.id}`)
    logger.info(`Processing dashboards for run ${metadataRun.id}...`)
    items.push(
        ...(await createDownloadJobs({
            type: MetadataDownloadType.DASHBOARD,
            items: metadataRun.dashboards,
            runId: metadataRun.id,
        }))
    )
    logger.info(`Finished processing dashboards for run ${metadataRun.id}`)
    logger.info(
        `Queuing ${items.length} download jobs for run ${metadataRun.id}`
    )

    for (const item of items) {
        pushToQueue({
            queue: Queues.METADATA_DOWNLOAD,
            reference: item,
        })
    }
    logger.info(`Finished queuing download jobs for run ${metadataRun.id}`)
}
