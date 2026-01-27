import logger from '@/logging'
import { dhis2Client } from '@/clients/dhis2'
import * as fs from 'node:fs'
import { existsSync } from 'node:fs'
import { handleError, QueuedJobError } from '@/utils/error'
import { DataRun, DataUpload, UploadStrategy } from '@/generated/prisma/client'

export async function dataFromQueue(
    task: DataUpload & { run: DataRun }
): Promise<void> {
    try {
        const fileLocation = task.filename
        if (existsSync(fileLocation)) {
            await dataFromFile({
                filename: task.filename,
                strategy: task.strategy,
            })
        } else {
            throw new QueuedJobError(
                `No payload and file does not exist for data upload job: ${task.uid}`,
                false
            )
        }
    } catch (error) {
        if (error instanceof QueuedJobError) {
            throw error
        } else {
            if (error instanceof Error) {
                throw new QueuedJobError(error.message, false)
            } else {
                throw new QueuedJobError('Unknown error', false)
            }
        }
    }
}

export async function dataFromFile({
    filename,
    strategy,
}: {
    filename: string
    strategy: UploadStrategy
}): Promise<void> {
    try {
        if (
            !(await fs.promises
                .access(filename)
                .then(() => true)
                .catch(() => false))
        ) {
            throw new QueuedJobError(
                `Data file does not exist: ${filename}`,
                false
            )
        }

        const fileContent = await fs.promises.readFile(filename, 'utf8')
        const payload = JSON.parse(fileContent)

        if (!payload.dataValues || !Array.isArray(payload.dataValues)) {
            throw new QueuedJobError(
                `Invalid data file format: missing or invalid dataValues array in ${filename}`,
                false
            )
        }
        await uploadDataValues({ payload, filename, strategy })
    } catch (error) {
        if (error instanceof QueuedJobError) {
            throw error
        } else {
            if (error instanceof Error) {
                throw new QueuedJobError(error.message, false)
            } else {
                throw new QueuedJobError('Unknown error', false)
            }
        }
    }
}

async function uploadDataValues({
    payload,
    filename,
    strategy,
}: {
    payload: { dataValues: Array<Record<string, unknown>> }
    filename: string
    strategy: UploadStrategy
}) {
    try {
        const client = dhis2Client
        const url = `dataValueSets`
        const params = {
            importStrategy: strategy,
            async: false,
        }
        logger.info(`Uploading ${payload.dataValues.length} data values`)
        const response = await client.post(url, payload, {
            params,
        })
        const importSummary = response.data?.response
        const importCount = importSummary.importCount.imported
        const ignoredCount = importSummary.importCount.ignored
        logger.info(`${importCount} data values imported successfully`)
        if (ignoredCount > 0) {
            logger.warn(`${ignoredCount} data values ignored`)
        }
        logger.info(`Deleting ${filename} file`)
        await cleanupDataFile(filename)
        return
    } catch (e) {
        if (e instanceof Error) {
            handleError(e)
        }
    }
}

async function cleanupDataFile(filename: string): Promise<void> {
    try {
        if (
            await fs.promises
                .access(filename)
                .then(() => true)
                .catch(() => false)
        ) {
            await fs.promises.unlink(filename)
            logger.info(`Successfully deleted temporary file: ${filename}`)
        }
    } catch (cleanupError) {
        logger.warn(
            `Failed to delete temporary file: ${filename}`,
            cleanupError
        )
    }
}
