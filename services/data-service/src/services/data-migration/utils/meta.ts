import { DataServiceConfig } from '@packages/shared/schemas'
import logger from '@/logging'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { dhis2Client } from '@/clients/dhis2'
import { AxiosError } from 'axios'

export async function fetchMainConfiguration(
    configId: string
): Promise<DataServiceConfig> {
    try {
        logger.info(`Getting configuration from server for ${configId}...`)
        const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`
        const response = await dhis2Client.get<DataServiceConfig>(url)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            logger.error(
                `Could not get configuration ${configId} from server:`,
                error.message
            )
            if (error.response?.data) {
                logger.error(JSON.stringify(error.response?.data))
            }
        }
        throw error
    }
}
