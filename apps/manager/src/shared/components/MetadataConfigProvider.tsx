import React, { createContext, useContext } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import { FullLoader } from './FullLoader'
import { DatastoreKeys, DatastoreNamespaces } from '@packages/shared/constants'
import ErrorPage from './ErrorPage/ErrorPage'
import { MetadataConfig } from '@packages/shared/schemas'

const query = {
    config: {
        resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
        id: DatastoreKeys.METADATA,
    },
}

type Props = {
    dataStoreKey: DatastoreKeys
    children: React.ReactNode
}

const ConfigContext = createContext<MetadataConfig>(null as never)

export function useAppMetadataConfig() {
    const config = useContext<MetadataConfig>(ConfigContext)
    if (!config) {
        throw new Error(`Metadata configuration not found`)
    }
    return config
}

export const MetadataConfigProvider = ({ children }: Props) => {
    const { data, error, loading } = useDataQuery<{
        config: MetadataConfig
    }>(query)

    if (loading) {
        return <FullLoader />
    }

    if (error) {
        return <ErrorPage error={error} />
    }

    if (!data?.config) {
        return <ErrorPage error={new Error(`Metadata Config not found`)} />
    }

    return (
        <ConfigContext.Provider value={data.config}>
            {children}
        </ConfigContext.Provider>
    )
}
