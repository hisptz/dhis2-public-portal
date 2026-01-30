import { v4 } from 'uuid'
import path from 'node:path'
import fs from 'node:fs'
import logger from '@/logging'
import { ProcessedMetadata } from '@/services/metadata-migration/metadata-download'

export async function saveMetadataFile({
    data,
}: {
    data: ProcessedMetadata
}): Promise<string> {
    const fileLocation = `outputs/metadata/${v4()}.json`
    const dir = path.dirname(fileLocation)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(
        fileLocation,
        JSON.stringify(data, null, 2),
        'utf8'
    )

    logger.info(`Data saved to ${fileLocation}`)
    logger.info(`Queuing file for upload: ${fileLocation}`)
    return fileLocation
}
