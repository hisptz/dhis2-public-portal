import { ConnectionStatus } from '@/types/connection'
import {
    DataEngine,
    FetchError,
    RestAPILink,
    type DataEngineConfig,
} from '@dhis2/data-engine'

export class D2HttpClient {
    baseURL: URL
    pat: string
    private engineReady: Promise<DataEngine>

    constructor(baseURL: string, pat: string) {
        this.baseURL = D2HttpClient.sanitizeURL(baseURL)
        this.pat = pat
        this.engineReady = this.initEngine(baseURL, pat)
    }

    private async initEngine(
        baseURL: string,
        pat: string
    ): Promise<DataEngine> {
        let apiVersion = 42
        try {
            const url = new URL('system/info', this.baseURL)
            const response = await fetch(url, {
                cache: 'no-store',
                headers: { Authorization: `ApiToken ${pat}` },
            })
            if (response.ok) {
                const info = (await response.json()) as { version?: string }
                const parsed = D2HttpClient.parseApiVersion(info.version)
                if (parsed !== null) {
                    apiVersion = parsed
                }
            }
        } catch {
            // fall back to default apiVersion
        }

        const config: DataEngineConfig = {
            baseUrl: baseURL.replace(/\/api\/?$/, '').replace(/\/$/, ''),
            apiVersion,
            apiToken: pat,
        }
        return new DataEngine(new RestAPILink(config))
    }

    private static parseApiVersion(version?: string): number | null {
        if (!version) return null
        const parts = version.split('.')
        const major = parseInt(parts[0], 10)
        const minor = parseInt(parts[1], 10)
        if (isNaN(major)) return null
        return major === 2 ? (isNaN(minor) ? null : minor) : major
    }

    static sanitizeURL(baseURL: string): URL {
        if (baseURL.endsWith('/api') || baseURL.endsWith('/api/')) {
            if (baseURL.endsWith('/')) {
                return new URL(baseURL)
            }
            return new URL(`${baseURL}/`)
        }
        if (baseURL.endsWith('/')) {
            return new URL('api/', baseURL)
        }
        return new URL('api/', `${baseURL}/`)
    }

    async getIcon(path: string) {
        const url = new URL(`${path}`, this.baseURL)
        const response = await fetch(url, {
            cache: 'force-cache',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
                Accept: 'application/octet-stream;charset=utf-8',
            },
        })

        const status = response.status
        if (status >= 400) {
            throw `Request failed with status code ${status}`
        }

        const blob = await response.blob()
        return new Response(blob, {
            headers: {
                ...response.headers,
            },
        })
    }

    async getRaw(path: string) {
        const url = new URL(`${path}`, this.baseURL)
        const response = await fetch(url, {
            cache: 'default',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
            },
        })
        const status = response.status
        if (status >= 400) {
            console.error(await response.json())
            throw `Request failed with status code ${status}`
        }
        return response
    }

    /*
     * This is used to verify the following
     * The BASE URL is valid and accessible
     * The AUTH token is valid
     *
     * Additional checks:
     * TODO: Check if the DHIS2 instance is supported
     * TODO: Verify if the token has correct authorities
     *  TODO: Check if the token does not access potentially dangerous authorities
     *
     * */
    async verifyClient(): Promise<ConnectionStatus> {
        const url = `system/info`
        try {
            const response = await this.get<{
                version: string
                systemName: string
            }>(url)
            return {
                status: 'OK',
                version: response?.version,
                name: response?.systemName,
            }
        } catch (e) {
            console.error(`DHIS2 client verification failed!`)
            if (e instanceof FetchError) {
                if (e.type === 'access') {
                    return {
                        status: 'ERROR',
                        title: 'Invalid credentials',
                        message:
                            'Could not access DHIS2 instance. Please verify your credentials and try again.',
                    }
                }
                if (e.details?.httpStatusCode === 404) {
                    return {
                        status: 'ERROR',
                        title: 'Invalid DHIS2 URL',
                        message:
                            'Could not access DHIS2 instance. Please verify the provided DHIS2 URL is correct and try again.',
                    }
                }
                return {
                    status: 'ERROR',
                    title: 'Invalid DHIS2 connection',
                    message:
                        'Could not access the DHIS2 instance. verify the provided DHIS2 URL is correct and try again.',
                }
            }

            return {
                status: 'ERROR',
                title: 'Unknown error',
                message:
                    'Could not access DHIS2 instance due to an unknown error. Please view the server logs for more details.',
            }
        }
    }

    async getFile(
        path: string,
        meta?: {
            params?: { [key: string]: string }
        }
    ) {
        const { params } = meta ?? {}
        const url = new URL(`${path}`, this.baseURL)

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value)
            })
        }

        const detailsUrl = path.replace('/data', '')

        const details = await this.get<{ name: string; url: string }>(
            detailsUrl
        )
        if (details == null) {
            return
        }
        const fileDetails = await this.get<{ name: string }>(
            `fileResources/${details.url}`
        )

        const response = await fetch(url, {
            cache: 'force-cache',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
                Accept: 'application/octet-stream;charset=utf-8',
            },
        })

        const status = response.status

        if (status >= 400) {
            console.error(await response.json())
            throw `Request failed with status code ${status}`
        }

        const blob = await response.blob()
        return new Response(blob, {
            headers: {
                ...response.headers,
                'content-disposition': `attachment; filename="${fileDetails?.name}"`,
            },
        })
    }

    async get<T>(
        path: string,
        meta?: {
            params?: { [key: string]: string }
        }
    ) {
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }
        const engine = await this.engineReady
        return engine
            .get(url)
            .catch((e) =>
                D2HttpClient.handleFetchError(e, `GET ${path}`)
            ) as Promise<T>
    }

    async post<T, R>(
        path: string,
        body?: T,
        meta?: {
            params?: { [key: string]: string }
        }
    ) {
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }
        const engine = await this.engineReady
        return engine
            .post(url, body)
            .catch((e) =>
                D2HttpClient.handleFetchError(e, `POST ${path}`)
            ) as Promise<R>
    }

    async put<T, R>(
        path: string,
        body?: T,
        meta?: {
            params?: { [key: string]: string }
        }
    ) {
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }
        const engine = await this.engineReady
        return engine
            .put(url, body)
            .catch((e) =>
                D2HttpClient.handleFetchError(e, `PUT ${path}`)
            ) as Promise<R>
    }

    async postFeedback<T>(
        path: string,
        meta?: { params?: { [key: string]: string } }
    ) {
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }
        const engine = await this.engineReady
        return engine
            .post(url, '')
            .catch((e) =>
                D2HttpClient.handleFetchError(e, `POST ${path}`)
            ) as Promise<T>
    }

    static handleFetchError(e: unknown, context?: string): never {
        const prefix = context ? `[D2HttpClient:${context}]` : '[D2HttpClient]'
        if (e instanceof FetchError) {
            console.error(
                `${prefix} ${e.type} error (HTTP ${e.details?.httpStatusCode ?? 'unknown'}):`,
                e.message
            )
        } else {
            console.error(`${prefix} Unexpected error:`, e)
        }
        throw e
    }
}
