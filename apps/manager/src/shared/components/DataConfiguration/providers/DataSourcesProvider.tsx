import { createContext, useContext } from 'react'
import { DataServiceConfig } from '@packages/shared/schemas'
import { useGetDataSources } from '../hooks/data'
import { FullLoader } from '../../FullLoader'
import ErrorPage from '../../ErrorPage/ErrorPage'

const DataSourcesContext = createContext<DataServiceConfig[] | null>(null)
const RefreshDataSourcesContext = createContext<() => void>(() => {})

export function useDataSources() {
    const dataSources = useContext(DataSourcesContext)
    if (dataSources === null) {
        throw new Error(
            `useDataSources must be used within a DataSourcesProvider`
        )
    }
    return dataSources
}

export function useRefreshDataSources() {
    return useContext(RefreshDataSourcesContext)
}

export function DataSourcesProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { dataSources, loading, refetch, error } = useGetDataSources()

    if (loading) {
        return <FullLoader />
    }

    if (error) {
        return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />
    }

    return (
        <DataSourcesContext.Provider value={dataSources ?? []}>
            <RefreshDataSourcesContext.Provider value={refetch}>
                {children}
            </RefreshDataSourcesContext.Provider>
        </DataSourcesContext.Provider>
    )
}
