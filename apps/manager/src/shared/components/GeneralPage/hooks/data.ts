import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { MetadataConfig } from "@packages/shared/schemas";

const query = {
	metadata: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.METADATA}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	metadata: MetadataConfig;
};

export function useMetadataQuery() {
	const { data, ...rest } = useDataQuery<Response>(query);

	return {
		metadata: data?.metadata,
		...rest,
	};
}