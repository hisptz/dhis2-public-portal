import {
    MetadataRun,
    MetadataUpload,
    ProcessStatus,
} from '@/generated/prisma/client'
import { readFile } from 'node:fs/promises'
import { dbClient } from '@/clients/prisma'
import { ProcessedMetadata } from '@/services/metadata-migration/metadata-download'
import { existsSync } from 'node:fs'
import { AxiosInstance } from 'axios'
import { createSourceClient } from '@/clients/dhis2'

export async function uploadMetadata({
    metadata,
    client,
}: {
    metadata: ProcessedMetadata['metadata']
    client: AxiosInstance
}) {
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
    const fileContent = await readFile(filename, 'utf8')
    const payload = JSON.parse(fileContent) as ProcessedMetadata
    const client = createSourceClient(task.run.mainConfigId)
    const uploadResponse = await uploadMetadata({
        metadata: payload.metadata,
        client,
    })
}
