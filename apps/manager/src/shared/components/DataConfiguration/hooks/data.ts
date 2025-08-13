import { DatastoreNamespaces } from "@packages/shared/constants";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useDataQuery } from "@dhis2/app-runtime";

const query = {
	config: {
		resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
		params: {
			fields: ".",
		},
	},
};

interface QueryResponse {
	config: {
		entries: Array<{ key: string; value: DataServiceConfig }>;
	};
}

export function useGetDataSources() {
	const { data, loading, refetch, ...rest } =
		useDataQuery<QueryResponse>(query);

	return {
		...rest,
		loading,
		refetch,
		dataSources: data?.config.entries?.map(({ value }) => value),
	};
}

const singleQuery: any = {
	config: {
		resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
		id: ({ id }: { id: string }) => id,
	},
};

interface SingleQueryResponse {
	config: DataServiceConfig;
}

export function useGetDataSource(id: string) {
	const { data, loading, refetch, ...rest } =
		useDataQuery<SingleQueryResponse>(singleQuery, {
			variables: {
				id,
			},
			lazy: true,
		});

	return {
		...rest,
		loading,
		refetch,
		dataSource: data?.config,
	};
}
