import { useDataQuery } from "@dhis2/app-runtime";
import { useMemo } from "react";

const visQuery = {
	vis: {
		resource: "visualizations",
		params: ({ type }: { type: string }) => ({
			fields: ["id", "displayName", "type"],
			order: "name:asc",
			paging: false,
			filter: type ? [`type:eq:${type}`] : undefined,
		}),
	},
};

const mapQuery = {
	maps: {
		resource: "maps",
		params: () => ({
			fields: ["id", "displayName"],
			paging: false,
		}),
	},
};

type VisualizationQueryResponse = {
	vis: {
		visualizations: Array<{
			id: string;
			displayName: string;
			type: string;
		}>;
	};
};

type MapQueryResponse = {
	maps: {
		maps: Array<{
			id: string;
			displayName: string;
		}>;
	};
};

export function useVisualizationNames(visualizationIds: string[]) {
	const visQueryResult = useDataQuery<VisualizationQueryResponse>(visQuery, {
		variables: { type: "" },
		lazy: visualizationIds.length === 0,
	});

	const mapQueryResult = useDataQuery<MapQueryResponse>(mapQuery, {
		lazy: visualizationIds.length === 0,
	});

	const visualizationNames = useMemo(() => {
		const visMap = new Map<string, string>();
		if (visQueryResult.data?.vis?.visualizations) {
			visQueryResult.data.vis.visualizations.forEach((vis) => {
				visMap.set(vis.id, vis.displayName);
			});
		}
		if (mapQueryResult.data?.maps?.maps) {
			mapQueryResult.data.maps.maps.forEach((map) => {
				visMap.set(map.id, map.displayName);
			});
		}
		return visMap;
	}, [visQueryResult.data, mapQueryResult.data]);

	return {
		visualizationNames,
		loading: visQueryResult.loading || mapQueryResult.loading,
		error: visQueryResult.error || mapQueryResult.error,
	};
}
