import { useDataQuery } from "@dhis2/app-runtime";

const routeQuery: any = {
	route: {
		resource: "routes",
		id: ({ id }: { id: string }) => id,
	},
};

export interface Route {
	id: string;
	name: string;
	url: string;
}

interface RouteQueryResponse {
	route: Route;
}

export function useRoute(routeId: string | undefined, options?: { lazy?: boolean }) {
	const { loading, data, error, refetch } = useDataQuery<RouteQueryResponse>(
		routeQuery,
		{
			variables: {
				id: routeId,
			},
			lazy: options?.lazy ?? !routeId,
		}
	);

	return {
		loading,
		route: data?.route,
		error,
		refetch,
	};
}
