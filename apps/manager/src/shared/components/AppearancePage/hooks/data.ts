import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { AppAppearanceConfig } from "@packages/shared/schemas";


const query: any = {
	appearance: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.APPEARANCE}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	appearance: AppAppearanceConfig;
};

export function useAppearanceQuery() {
	const { data, ...rest } = useDataQuery<Response>(query);

	return {
		appearance: data?.appearance,
		...rest,
	};
}