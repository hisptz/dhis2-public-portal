import { useDataQuery } from "@dhis2/app-runtime";
import {
	VisualizationConfig,
	visualizationFields,
} from "@packages/shared/schemas";

type VisualizationConfigQueryResponse = {
	visualization: VisualizationConfig;
};

const visualizationQuery = {
	visualization: {
		resource: "visualizations",
		id: ({ id }: { id: string }) => id,
		params: () => ({
			fields: visualizationFields,
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
