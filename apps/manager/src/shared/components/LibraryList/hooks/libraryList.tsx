import { DatastoreNamespaces } from "@packages/shared/constants";
import { useDataQuery } from "@dhis2/app-runtime";
import { Pagination } from "@hisptz/dhis2-utils";
import { sortBy } from "lodash";
import { LibraryData } from "@packages/shared/schemas";

const query: any = {
	libraries: {
		resource: `dataStore/${DatastoreNamespaces.MODULES}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	libraries: {
		pager: Pagination;
		entries: {
			key: string;
			value: LibraryData;
		}[];
	};
};

export function useLibraryList() {
	const { data, ...rest } = useDataQuery<Response>(query);

	return {
		libraries: sortBy(
			data?.libraries?.entries?.map(({ value }) => value),
			"sortOrder",
		),
		...rest,
	};
}

const singleQuery: any = {
	library: {
		resource: `dataStore/${DatastoreNamespaces.MODULES}`,
		id: ({ id }: { id: string }) => id,
		params: {
			fields: ".",
		},
	},
};

type SingleResponse = {
	library: LibraryData;
};

export function useLibraryById(id: string) {
	const { data, ...rest } = useDataQuery<SingleResponse>(singleQuery, {
		variables: {
			id,
		},
	});

	return {
		library: data?.library,
		...rest,
	};
}
