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
    private engineReady: DataEngine | null
    private _initPromise: Promise<void> | null

    constructor(baseURL: string, pat: string) {
        this.baseURL = D2HttpClient.sanitizeURL(baseURL)
        this.pat = pat
        this.engineReady = null
        this._initPromise = null
    }

    async init(): Promise<void> {
        if (this.engineReady) return
        if (!this._initPromise) {
            this._initPromise = this._initialize().catch((err) => {
                this._initPromise = null // allow retry on next call
                throw err
            })
        }
        return this._initPromise
    }

    private async _initialize(): Promise<void> {
        let apiVersion = 40 // default to 2.40 for older DHIS2 instances
        try {
            const url = new URL('system/info', this.baseURL)
            const response = await fetch(url, {
                cache: 'no-store',
                headers: { Authorization: `ApiToken ${this.pat}` },
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
            baseUrl: this.baseURL
                .toString()
                .replace(/\/api\/?$/, '')
                .replace(/\/$/, ''),
            apiVersion,
            apiToken: this.pat,
        }
        this.engineReady = new DataEngine(new RestAPILink(config))
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
        await this.init()
        const url = path
        const response: Response = (await this.engineReady!.fetch(url, {
            cache: 'force-cache',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
                Accept: 'application/octet-stream;charset=utf-8',
            },
        })) as Response

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
        await this.init()

        const result = await this.engineReady!.fetch(path, {
            cache: 'default',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
            },
        })

        // The data engine returns a Blob directly for binary content types
        if (result instanceof Blob) {
            return new Response(result, { status: 200 })
        }

        const response = result as Response
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
        await this.init()
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
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

        const result = await this.engineReady!.fetch(url, {
            cache: 'force-cache',
            headers: {
                Authorization: `ApiToken ${this.pat}`,
                Accept: 'application/octet-stream;charset=utf-8',
            },
        })

        // The data engine returns a Blob directly for binary content types
        if (result instanceof Blob) {
            return new Response(result, {
                headers: {
                    'content-disposition': `attachment; filename="${fileDetails?.name}"`,
                },
            })
        }

        const response = result as Response
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
        await this.init()
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }

        return this.engineReady!.get(url).catch((e) =>
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
        await this.init()
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }

        return this.engineReady!.post(url, body).catch((e) =>
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
        await this.init()
        const { params } = meta ?? {}
        let url = path
        if (params) {
            const qs = new URLSearchParams(params).toString()
            url = `${path}?${qs}`
        }

        return this.engineReady!.put(url, body).catch((e) =>
            D2HttpClient.handleFetchError(e, `PUT ${path}`)
        ) as Promise<R>
    }

    async postFeedback<T>(
        path: string,
        meta?: { params?: { [key: string]: string } }
    ) {
        await this.init()
        const { params } = meta ?? {}

        const mutation = { resource: path, type: 'create' as const, params }
        return this.engineReady!.mutate(
            mutation as Parameters<NonNullable<typeof this.engineReady>['mutate']>[0]
        ).catch((e) => D2HttpClient.handleFetchError(e, `POST ${path}`)) as Promise<T>
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
