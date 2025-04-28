import { useDataMutation } from "@dhis2/app-runtime";

const updateMutation: any = {
	type: "update",
	resource: "dataStore",
	id: ({ key, namespace }: { key: string; namespace: string }) =>
		`${namespace}/${key}`,
	data: ({ data }: { data: Record<string, any> }) => data,
};

export function useUpdateDatastoreEntry<DataType>({
	namespace,
}: {
	namespace: string;
}) {
	const [mutate, { loading, error }] = useDataMutation(updateMutation, {
		variables: {
			namespace,
		},
	});

	const update = async ({ key, data }: { key: string; data: DataType }) => {
		return await mutate({
			key,
			namespace,
			data,
		});
	};

	return {
		update,
		loading,
		error,
	};
}
