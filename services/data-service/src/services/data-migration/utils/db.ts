import { DataDownloadUpdateInput } from '@/generated/prisma/models/DataDownload'
import { DataUploadUpdateInput } from '@/generated/prisma/models/DataUpload'
import { Dimensions } from '@/schemas/metadata'
import { DataServiceDataSourceItemsConfig } from '@packages/shared/schemas'
import { dbClient } from '@/clients/prisma'
import { UploadStrategy } from '@/generated/prisma/enums'

export async function createDownloadJob({
    filters,
    dimensions,
    config,
    runId,
}: {
    dimensions: Dimensions
    filters?: Dimensions
    config: DataServiceDataSourceItemsConfig
    runId: string
}) {
    return dbClient.dataDownload.create({
        data: {
            filters,
            dimensions,
            configId: config.id,
            run: {
                connect: {
                    uid: runId,
                },
            },
        },
    })
}

export async function updateDownloadStatus(
    uid: string,
    data: DataDownloadUpdateInput
) {
    await dbClient.dataDownload.update({
        where: {
            uid,
        },
        data,
    })
}

export async function createUploadJob({
    filename,
    runId,
    downloadId,
    isDelete = false,
}: {
    filename: string
    runId: number
    downloadId: number
    isDelete: boolean
}) {
    return dbClient.dataUpload.create({
        data: {
            filename,
            runId,
            dataDownloadId: downloadId,
            strategy: isDelete
                ? UploadStrategy.DELETE
                : UploadStrategy.CREATE_AND_UPDATE,
        },
    })
}

export async function updateUploadStatus(
    uid: string,
    data: DataUploadUpdateInput
) {
    return dbClient.dataUpload.update({
        where: {
            uid,
        },
        data,
    })
}
