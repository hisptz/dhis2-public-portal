import { useDataQuery } from "@dhis2/app-runtime";
import { Route } from "./useRoute";

const routesQuery: any = {
	routes: {
		resource: "routes",
		params: {
			fields: ["id", "name", "url"],
			paging: false,
		},
	},
};

interface RoutesQueryResponse {
	routes: {
		routes: Route[];
	};
}

export function useRoutes() {
	const { loading, data, error, refetch } = useDataQuery<RoutesQueryResponse>(routesQuery);

	return {
		loading,
		routes: data?.routes?.routes || [],
		error,
		refetch,
	};
}
