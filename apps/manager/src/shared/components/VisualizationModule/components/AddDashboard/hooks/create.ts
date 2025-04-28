import { useDataEngine } from "@dhis2/app-runtime";
import { useCallback } from "react";
import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";

const getMutation = (id: string) => ({
	type: "create",
	resource: `dataStore/${DatastoreNamespaces.MODULES}/${id}`,
	data: ({ data }: { data: VisualizationModuleConfig }) => data,
});

export function useCreateDashboard() {
	const engine = useDataEngine();
	const createDashboard = useCallback(
		async (data: VisualizationModuleConfig) => {
			await engine.mutate(getMutation(data.id) as any, {
				variables: {
					data,
				},
			});
		},
		[engine],
	);

	return {
		createDashboard,
	};
}
