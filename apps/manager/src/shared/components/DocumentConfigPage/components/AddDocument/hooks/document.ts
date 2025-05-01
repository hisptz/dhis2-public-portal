import { useDataEngine } from "@dhis2/app-runtime";
import { useCallback } from "react";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { DocumentsModule } from "@packages/shared/schemas";

const getMutation = (id: string) => ({
	type: "create",
	resource: `dataStore/${DatastoreNamespaces.MODULES}/${id}`,
	data: ({ data }: { data: DocumentsModule }) => data,
});

export function useCreateLibrary() {
	const engine = useDataEngine();
	const createLibrary = useCallback(
		async (data: DocumentsModule) => {
			await engine.mutate(getMutation(data.id) as any, {
				variables: {
					data,
				},
			});
		},
		[engine],
	);

	return {
		createLibrary,
	};
}
