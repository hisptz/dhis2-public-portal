import { useEffect } from 'react'
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { FullLoader } from './FullLoader'
import { DatastoreNamespaces } from '@packages/shared/constants'

function getMutation(key: string) {
    return {
        type: 'create' as const,
        resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${key}`,
        data: ({ data }: { data: Record<string, unknown> }) => data,
    }
}

function getQuery(key: string) {
    return {
        config: {
            resource: 'dataStore',
            id: `${DatastoreNamespaces.MAIN_CONFIG}/${key}`,
        },
    }
}

type Props = {
    dataStoreKey: string
    children: React.ReactNode
    defaultConfig?: Record<string, unknown> | unknown[]
}

export const InitConfigProvider = ({
    children,
    dataStoreKey,
    defaultConfig,
}: Props) => {
    const {
        data,
        loading: queryLoading,
        error: queryError,
    } = useDataQuery(getQuery(dataStoreKey))

    const [mutate, { loading: mutationLoading, error: mutationError }] =
        useDataMutation(getMutation(dataStoreKey))

    const create = async ({ data }: { data: Record<string, unknown> | unknown[] }) => {
        return await mutate({
            data,
        })
    }

    if (queryError || mutationError) {
        console.error(
            `Error in ${queryError ? 'getting' : 'creating'} default configurations:`,
            queryError,
            mutationError
        )
    }

    useEffect(() => {
        const createDefaultConfig = async () => {
            try {
                await create({
                    data: defaultConfig ?? {},
                })
            } catch (err) {
                console.error('Error creating default configurations:', err)
            }
        }

        if (!queryLoading && !data?.config) {
            createDefaultConfig()
        }
    }, [queryLoading])

    if (queryLoading) {
        return <FullLoader />
    }

    if (mutationLoading && !data?.config) {
        return <FullLoader />
    }

    return children
}
