import { useDataQuery } from "@dhis2/app-runtime";
import {  VisualizationItem } from "@packages/shared/schemas";

const visualizationQuery = {
	vis: {
		resource: "visualizations",
		id: ({ id }: { id: string }) => id,
		params: {
			fields: ["id", "displayName"],
		},
	},
};

type VisualizationQueryResponse = {
	vis: {
		id: string;
		displayName: string;
	};
};

const mapQuery = {
	map: {
		resource: "maps",
		id: ({ id }: { id: string }) => id,
		params: {
			fields: ["id", "displayName"],
		},
	},
};

type MapQueryResponse = {
	map: {
		id: string;
		displayName: string;
	};
};

export function useDashboardItemConfig({ id, type }: VisualizationItem) {
	const { loading: loadingVis, data: vis } =
		useDataQuery<VisualizationQueryResponse>(visualizationQuery, {
			variables: {
				id,
			},
			lazy: type == "MAP",
		});
	const { loading: loadingMap, data: map } = useDataQuery<MapQueryResponse>(
		mapQuery,
		{
			variables: {
				id,
			},
			lazy: type != "MAP",
		},
	);

	return {
		loading: loadingVis || loadingMap,
		config: vis?.vis ?? map?.map,
	};
}
 