import { useDataQuery } from "@dhis2/app-runtime";
import { VisualizationConfig } from "@packages/shared/schemas";

type VisualizationConfigQueryResponse = {
	visualization: VisualizationConfig;
};

const visualizationQuery = {
	visualization: {
		resource: "visualizations",
		id: ({ id }: { id: string }) => id,
		params: () => ({
			fields: "*,legend[*,set[id,displayName,legends[*]]]organisationUnits[id,path],rows[id,dimension,items],columns[id,dimension,items],filters[id,dimension,items],dataDimensionItems[*,indicator[id,displayName,legendSet[id,displayName,legends[*]]],dataElement[id,displayName,legendSet[id,displayName,legends[*]]],programIndicator[id,displayName,legendSet[id,displayName,legends[*]]],reportingRate[id,displayName,legendSet[id,displayName,legends[*]]]]",
		}),
	},
};

export function useVisualizationConfig(visualizationId: string) {
	const { data, loading, error, refetch } =
		useDataQuery<VisualizationConfigQueryResponse>(visualizationQuery, {
			variables: { id: visualizationId },
		});

	const visualizationConfig = data?.visualization;

	if (error) {
		console.error(
			`Could not get visualization details for visualization ${visualizationId}`,
		);
	}

	return {
		visualizationConfig,
		loading,
		error: error ? "Could not get visualization details" : undefined,
		refetch,
	};
}
