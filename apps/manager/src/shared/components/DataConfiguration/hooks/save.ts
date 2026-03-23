import { AddSourceFormValues } from '../components/AddDataSourceForm'
import {
    FetchError,
    useAlert,
    useDataEngine,
    useDataMutation,
} from '@dhis2/app-runtime'
import { DataServiceConfig } from '@packages/shared/schemas'
import { DatastoreNamespaces } from '@packages/shared/constants'
import i18n from '@dhis2/d2-i18n'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useRefreshDataSources } from '../providers/DataSourcesProvider'
import { deleteQueues } from '../../../services/dataServiceClient'

const createRouteMutation = {
    type: 'create' as const,
    resource: 'routes',
    data: ({ data }: { data: Record<string, unknown> }) => data,
}

function generateRouteMutation(id: string) {
    return {
        type: 'create' as const,
        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${id}`,
        data: ({ data }: { data: DataServiceConfig }) => data,
    }
}

export function useCreateDataSource(onClose?: () => void) {
    const refreshList = useRefreshDataSources()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const navigate = useNavigate({
        from: '/data-service-configuration/',
    })
    const [createRoute] = useDataMutation(createRouteMutation)
    const engine = useDataEngine()
    const save = async (data: AddSourceFormValues) => {
        try {
            const routePayload = {
                code: data.id,
                disabled: false,
                name: `[data service] ${data.source.name}`,
                url: `${data.source.url}/api/**`,
                auth: data.source.pat
                    ? {
                          type: 'api-token',
                          token: data.source.pat,
                      }
                    : {
                          type: 'http-basic',
                          username: data.source.username,
                          password: data.source.password,
                      },
            }

            const response = (await createRoute({ data: routePayload })) as {
                response: { uid: string }
            }
            const routeId = response.response.uid
            const payload = {
                source: {
                    name: data.source.name,
                    routeId,
                },
                id: data.id,
                itemsConfig: data.itemsConfig,
                visualizations: data.visualizations,
            } as DataServiceConfig

            await engine.mutate(generateRouteMutation(data.id), {
                variables: {
                    data: payload,
                },
            })

            show({
                message: i18n.t('Configuration saved successfully'),
                type: { success: true },
            })
            refreshList()

            if (onClose) {
                onClose()
            } else {
                navigate({
                    to: '/data-service-configuration',
                })
            }
        } catch (error) {
            if (error instanceof FetchError) {
                show({
                    message: `${i18n.t('Failed to save configuration')}:${error.message}`,
                    type: { critical: true },
                })
            }
            if (error instanceof Error) {
                show({
                    message: `${i18n.t('Failed to save configuration')}:${error.message}`,
                    type: { critical: true },
                })
            }
        }
    }

    return {
        save,
    }
}

const updateDataSourceMutation = {
    type: 'update' as const,
    resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
    id: ({ id }: { id: string }) => id,
    data: ({ data }: { data: DataServiceConfig }) => data,
}

export function useUpdateDataSource() {
    const navigate = useNavigate({
        from: '/data-service-configuration/$configId/edit/',
    })
    const { configId } = useParams({
        from: '/data-service-configuration/_provider/$configId/_provider/edit/_provider/',
    })
    const refreshList = useRefreshDataSources()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const engine = useDataEngine()
    // @ts-expect-error DHIS2 types incorrectly restrict id to string; function id is supported at runtime
    const [mutate] = useDataMutation(updateDataSourceMutation, {
        variables: {
            id: configId,
        },
        onComplete: () => {
            show({
                message: i18n.t('Configuration updated successfully'),
                type: { success: true },
            })
        },
        onError: (error) => {
            show({
                message: `${i18n.t('Could not save changes')}: ${error.message}`,
                type: { critical: true },
            })
        },
    })

    const save = async (data: DataServiceConfig) => {
        try {
            const currentConfig = await engine.query(
                {
                    config: {
                        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
                        id: configId,
                    },
                },
                {
                    variables: {
                        id: configId,
                    },
                }
            )

            type ConfigRecord = {
                config: Record<string, unknown> & { dataItems?: unknown }
            }
            const mergedData = {
                ...(currentConfig as ConfigRecord).config,
                ...data,
                ...(!(data as Record<string, unknown>).dataItems &&
                (currentConfig as ConfigRecord).config?.dataItems
                    ? {
                          dataItems: (currentConfig as ConfigRecord).config
                              .dataItems,
                      }
                    : {}),
            }
            await mutate({ data: mergedData })
        } catch (error) {
            console.warn(
                'Could not fetch current config, using provided data as-is:',
                error
            )
            await mutate({ data })
        }

        refreshList()
        await navigate({
            to: '/data-service-configuration/$configId',
            params: {
                configId,
            },
        })
    }

    return {
        save,
    }
}

export function useUpdateConnection() {
    const refreshList = useRefreshDataSources()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const engine = useDataEngine()
    const { configId } = useParams({
        from: '/data-service-configuration/_provider/$configId/_provider/edit/_provider/',
    })

    const updateConnection = async (
        data: {
            name: string
            url: string
            pat?: string
            username?: string
            password?: string
            routeId: string
        },
        callbacks?: {
            onSuccess?: (updatedConfig: Record<string, unknown>) => void
        }
    ) => {
        try {
            const existingRoute = await engine.query(
                {
                    route: {
                        resource: 'routes',
                        id: data.routeId,
                    },
                },
                {
                    variables: {
                        id: data.routeId,
                    },
                }
            )

            const hasCredentials =
                !!data.pat || (!!data.username && !!data.password)

            const routePayload: Record<string, unknown> = {
                ...(existingRoute as { route: Record<string, unknown> }).route,
                name: `[data service] ${data.name}`,
                url: `${data.url}/api/**`,
            }

            if (hasCredentials) {
                routePayload.auth = data.pat
                    ? {
                          type: 'api-token',
                          token: data.pat,
                      }
                    : {
                          type: 'http-basic',
                          username: data.username,
                          password: data.password,
                      }
            } else if (
                (existingRoute as { route: Record<string, unknown> }).route
                    ?.auth
            ) {
                routePayload.auth = (
                    existingRoute as { route: Record<string, unknown> }
                ).route.auth
            }

            await engine.mutate({
                type: 'update' as const,
                resource: 'routes',
                id: data.routeId,
                data: routePayload,
            })
            const currentConfig = await engine.query(
                {
                    config: {
                        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
                        id: configId,
                    },
                },
                {
                    variables: {
                        id: configId,
                    },
                }
            )

            const updatedConfig = {
                ...(currentConfig as { config: Record<string, unknown> })
                    .config,
                source: {
                    ...((currentConfig as { config: Record<string, unknown> })
                        .config.source as Record<string, unknown>),
                    name: data.name,
                },
            }

            await engine.mutate({
                type: 'update' as const,
                resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
                id: configId,
                data: updatedConfig,
            })

            show({
                message: i18n.t('Connection updated successfully'),
                type: { success: true },
            })
            refreshList()
            if (callbacks?.onSuccess) {
                callbacks.onSuccess(updatedConfig)
            }
        } catch (error) {
            if (error instanceof Error) {
                show({
                    message: `${i18n.t('Failed to update connection')}: ${error.message}`,
                    type: { critical: true },
                })
            }
            throw error
        }
    }

    return {
        updateConnection,
    }
}

export function useDeleteDataSource() {
    const refreshList = useRefreshDataSources()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const engine = useDataEngine()

    const deleteConfig = async (config: DataServiceConfig) => {
        try {
            try {
                await deleteQueues(engine, config.id)
            } catch (queueError) {
                console.warn(
                    `Failed to delete queues for config ${config.id}:`,
                    queueError
                )
            }

            await engine.mutate({
                type: 'delete' as const,
                resource: 'routes',
                id: config.source.routeId,
            })

            await engine.mutate({
                type: 'delete' as const,
                resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
                id: config.id,
            })

            show({
                message: i18n.t('Configuration deleted successfully'),
                type: { success: true },
            })
            refreshList()
        } catch (error) {
            if (error instanceof FetchError) {
                show({
                    message: `${i18n.t('Failed to delete configuration')}: ${error.message}`,
                    type: { critical: true },
                })
            }
            if (error instanceof Error) {
                show({
                    message: `${i18n.t('Failed to delete configuration')}: ${error.message}`,
                    type: { critical: true },
                })
            }
            throw error
        }
    }

    return {
        deleteConfig,
    }
}
