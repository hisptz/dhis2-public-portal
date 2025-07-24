import React, { createContext, useContext } from "react";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useGetDataSources } from "../hooks/data";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";

const DataSourcesContext = createContext<DataServiceConfig[]>([]);
const RefreshDataSourcesContext = createContext<() => void>(() => {});

export function useDataSources() {
	return useContext(DataSourcesContext);
}

export function useRefreshDataSources() {
	return useContext(RefreshDataSourcesContext);
}

export function DataSourcesProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { dataSources, loading, refetch, error } = useGetDataSources();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	return (
		<DataSourcesContext.Provider value={dataSources ?? []}>
			<RefreshDataSourcesContext.Provider value={refetch}>
				{children}
			</RefreshDataSourcesContext.Provider>
		</DataSourcesContext.Provider>
	);
}
