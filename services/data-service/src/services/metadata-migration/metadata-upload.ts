import {
    MetadataRun,
    MetadataUpload,
    ProcessStatus,
} from '@/generated/prisma/client'
import { readFile, rm } from 'node:fs/promises'
import { dbClient } from '@/clients/prisma'
import { ProcessedMetadata } from '@/services/metadata-migration/metadata-download'
import { existsSync } from 'node:fs'
import { AxiosInstance } from 'axios'
import { dhis2Client } from '@/clients/dhis2'
import { logWorker } from '@/rabbit/utils'

export async function uploadMetadata({
    metadata,
    client,
}: {
    metadata: ProcessedMetadata['metadata']
    client: AxiosInstance
}) {
    logWorker('info', `Uploading metadata to DHIS2...`)
    const url = `metadata`
    const response = await client.post<{
        status: string
    }>(url, metadata, {
        params: {
            async: false,
            importMode: 'COMMIT',
            importReportMode: 'ERRORS',
            importStrategy: 'CREATE_AND_UPDATE',
            atomicMode: 'NONE',
            skipSharing: true,
            userOverrideMode: 'CURRENT',
        },
    })
    logWorker('info', `Metadata upload done`)
    return response.data
}

export async function uploadMetadataFromQueue({
    task,
}: {
    task: MetadataUpload & { run: MetadataRun }
}): Promise<void> {
    const filename = task.filename
    if (!existsSync(filename)) {
        await dbClient.metadataUpload.update({
            where: { id: task.id },
            data: { status: ProcessStatus.FAILED, error: 'File not found' },
        })
        return
    }
    logWorker('info', `Fetching metadata file for task: ${task.uid}`)
    const fileContent = await readFile(filename, 'utf8')
    const payload = JSON.parse(fileContent) as ProcessedMetadata
    const uploadResponse = await uploadMetadata({
        metadata: payload.metadata,
        client: dhis2Client,
    })
    await dbClient.metadataUpload.update({
        where: {
            uid: task.uid,
        },
        data: {
            status: ProcessStatus.DONE,
            finishedAt: new Date(),
            summary: uploadResponse,
        },
    })
    logWorker(
        'info',
        `Deleting file ${filename} for metadata upload task ${task.uid}`
    )
    await rm(filename, { force: true })
    logWorker('info', `Metadata upload for task ${task.uid} done`)
}
