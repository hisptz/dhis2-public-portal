import logger from '@/logging'
import { dhis2Client } from '@/clients/dhis2'
import { AxiosError } from 'axios'
import * as fs from 'node:fs'
import { existsSync } from 'node:fs'

export interface DataUploadJob {
    mainConfigId: string
    filename?: string
    payload?: any
    queuedAt?: string
    downloadedFrom?: string
}

export async function dataFromQueue(jobData: any): Promise<void> {
    try {
        const { mainConfigId, filename, payload, isDelete } = jobData

        if (!validateUploadJobData(jobData)) {
            throw new Error(`Invalid job data for config: ${mainConfigId}`)
        }

        const fileLocation = `outputs/${mainConfigId}/${filename}.json`

        if (existsSync(fileLocation)) {
            await dataFromFile({ filename, configId: mainConfigId, isDelete })
        } else if (payload) {
            await dataFromPayload({
                payload,
                configId: mainConfigId,
                filename,
                isDelete,
            })
        } else {
            throw new Error(
                `No payload and file does not exist for data upload job: ${mainConfigId}`
            )
        }
    } catch (error: any) {
        logger.error(`Error processing data job:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
        })
        throw error
    }
}

function validateUploadJobData(jobData: any): boolean {
    const { mainConfigId, filename, payload } = jobData

    if (!mainConfigId) {
        logger.error('Missing required mainConfigId in upload job data')
        return false
    }

    if (!filename && !payload) {
        logger.error('Missing both filename and payload in upload job data', {
            hasMainConfigId: !!mainConfigId,
            hasFilename: !!filename,
            hasPayload: !!payload,
        })
        return false
    }

    return true
}

export async function dataFromFile({
    filename,
    configId,
    isDelete,
}: {
    filename: string
    configId: string
    isDelete?: boolean
}): Promise<void> {
    try {
        if (
            !(await fs.promises
                .access(filename)
                .then(() => true)
                .catch(() => false))
        ) {
            throw new Error(`Data file does not exist: ${filename}`)
        }

        const fileContent = await fs.promises.readFile(filename, 'utf8')
        const payload = JSON.parse(fileContent)

        if (!payload.dataValues || !Array.isArray(payload.dataValues)) {
            throw new Error(
                `Invalid data file format: missing or invalid dataValues array in ${filename}`
            )
        }
        if (isDelete) {
            logger.info(
                `Starting data deletion from file: ${filename} for config: ${configId}`
            )
            await deleteDataValues(payload, filename)
        } else {
            logger.info(
                `Starting data upload from file: ${filename} for config: ${configId}`
            )
            await uploadDataValues(payload, filename)
        }
    } catch (error: any) {
        logger.error(`Error uploading data from file ${filename}:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            configId,
        })

        throw error
    }
}

export async function dataFromPayload({
    payload,
    configId,
    filename,
    isDelete,
}: {
    payload: any
    configId: string
    filename: string
    isDelete?: boolean
}): Promise<void> {
    try {
        if (
            !payload ||
            !payload.dataValues ||
            !Array.isArray(payload.dataValues)
        ) {
            throw new Error(
                `Invalid payload format: missing or invalid dataValues array`
            )
        }
        if (isDelete) {
            logger.info(
                `Starting data deletion from payload for config: ${configId}`
            )
            await deleteDataValues(payload, filename)
        } else {
            logger.info(
                `Starting data upload from payload for config: ${configId}`
            )
            await uploadDataValues(payload, filename)
        }
    } catch (error: any) {
        logger.error(`Error from payload:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            configId,
        })

        throw error
    }
}

async function uploadDataValues(payload: any, filename: string) {
    try {
        const client = dhis2Client
        const url = `dataValueSets`
        const params = {
            importStrategy: 'CREATE_AND_UPDATE',
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
    } catch (e: any) {
        if (e instanceof AxiosError) {
            if (e.response?.status === 409) {
                const response = e.response!
                logger.warn(`Conflicts detected. These will be ignored`)
                logger.warn(
                    `While uploading the file some values were ignored. This normally means values already exist in DHIS2.`
                )
                logger.warn(
                    `Status code: ${response.status} - ${response.statusText}`
                )
                const importSummary = response.data?.response
                logger.error(importSummary)
                const importCount = importSummary.importCount.imported
                const ignoredCount = importSummary.importCount.ignored
                logger.info(`${importCount} data values imported successfully`)
                if (ignoredCount > 0) {
                    logger.warn(`${importCount} data values ignored`)
                }
                await cleanupDataFile(filename)

                throw e
            } else {
                const response = e.response
                logger.error(
                    `Status code: ${response?.status} - ${response?.statusText}`
                )
            }
            throw e
        }
        logger.error(`Error uploading file: ${e.message ?? JSON.stringify(e)}`)

        throw e
    }
}

async function deleteDataValues(payload: any, filename: string) {
    try {
        const client = dhis2Client
        const url = `dataValueSets`
        const params = {
            importStrategy: 'DELETE',
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
    } catch (e: any) {
        if (e instanceof AxiosError) {
            if (e.response?.status === 409) {
                const response = e.response!
                logger.warn(`Conflicts detected. These will be ignored`)
                logger.warn(
                    `While uploading the file some values were ignored. This normally means values already exist in DHIS2.`
                )
                logger.warn(
                    `Status code: ${response.status} - ${response.statusText}`
                )
                const importSummary = response.data?.response
                logger.error(importSummary)
                const importCount = importSummary.importCount.imported
                const ignoredCount = importSummary.importCount.ignored
                logger.info(`${importCount} data values imported successfully`)
                if (ignoredCount > 0) {
                    logger.warn(`${importCount} data values ignored`)
                }
                await cleanupDataFile(filename)
                throw e
            } else {
                const response = e.response
                logger.error(
                    `Status code: ${response?.status} - ${response?.statusText}`
                )
            }
            throw e
        }
        logger.error(`Error uploading file: ${e.message ?? JSON.stringify(e)}`)

        throw e
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

async function handleUploadAxiosError(
    error: AxiosError,
    filename: string
): Promise<void> {
    const response = error.response

    if (response?.status === 409) {
        logger.warn(`Conflicts detected of ${filename}`, {
            status: response.status,
            statusText: response.statusText,
        })

        const responseData = response.data as any
        const importSummary = responseData?.response
        if (importSummary) {
            const imported = importSummary.importCount?.imported || 0
            const ignored = importSummary.importCount?.ignored || 0

            logger.info(
                `Conflict summary: ${imported} imported, ${ignored} ignored`
            )
        }

        // Clean up file even on conflicts
        await cleanupDataFile(filename)

        return
    }

    logger.error(`HTTP error of ${filename}`, {
        status: response?.status,
        statusText: response?.statusText,
        data: response?.data,
    })
}
