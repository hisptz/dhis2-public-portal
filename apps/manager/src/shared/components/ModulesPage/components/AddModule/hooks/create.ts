import { useDataEngine } from "@dhis2/app-runtime";
import { useCallback } from "react";
import { BaseModule } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";

const getMutation = (id: string) => ({
	type: "create" as const,
	resource: `dataStore/${DatastoreNamespaces.MODULES}/${id}`,
	data: ({ data }: { data: BaseModule }) => data,
});

export function useCreateDashboard() {
	const engine = useDataEngine();
	const createDashboard = useCallback(
		async (data: BaseModule) => {
			await engine.mutate(getMutation(data.id), {
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
