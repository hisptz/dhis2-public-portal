import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { AppMenuConfig } from "@packages/shared/schemas";

const query = {
	menu: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.MENU}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	menu: AppMenuConfig;
};

export function useMenuQuery() {
	const { data, ...rest } = useDataQuery<Response>(query);

	return {
		menu: data?.menu,
		...rest,
	};
}