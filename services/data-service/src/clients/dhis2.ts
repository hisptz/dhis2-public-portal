import axios, { AxiosInstance } from 'axios'
import { config } from 'dotenv'
import { env } from '@/env'
import { DataServiceConfig } from '@packages/shared/schemas'
import { DatastoreNamespaces } from '@packages/shared/constants'

config()

export const dhis2Client = axios.create({
    baseURL: `${env.DHIS2_BASE_URL}/api/`,
    headers: {
        Accept: 'application/json',
        Authorization: `ApiToken ${env.DHIS2_PAT}`,
    },
})

export function createSourceClient(routeId: string): AxiosInstance {
    return axios.create({
        baseURL: `${env.DHIS2_BASE_URL}/api/routes/${routeId}/run/`,
        headers: {
            Accept: 'application/json',
            Authorization: `ApiToken ${env.DHIS2_PAT}`,
        },
    })
}

export async function getSourceClientFromConfig(
    configId: string
): Promise<AxiosInstance> {
    try {
        const configUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`
        const { data: config } = await dhis2Client.get(configUrl)

        if (!config?.source?.routeId) {
            throw new Error(`No routeId found in config ${configId}`)
        }

        return createSourceClient(config.source.routeId)
    } catch (error) {
        throw new Error(
            `Failed to get source client for config ${configId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

export function createDownloadClient({
    config,
}: {
    config: DataServiceConfig
}) {
    return axios.create({
        baseURL: `${env.DHIS2_BASE_URL}/api/routes/${config.source.routeId}/run`,
        headers: {
            Accept: 'application/json',
            Authorization: `ApiToken ${env.DHIS2_PAT}`,
        },
    })
}
