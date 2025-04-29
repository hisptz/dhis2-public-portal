import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

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

const datastoreQuery = {
	ds: {
		resource: "dataStore",
		id: ({ namespace }: { key: string; namespace: string }) =>
			`${namespace}`,
		params: ({ fields }: { fields: string }) => ({
			fields,
		}),
	},
};

export function useGetDatastoreEntries<
	DataType,
	Fields extends keyof DataType = keyof DataType,
>({ namespace, fields }: { namespace: string; fields?: string[] }) {
	const { data, loading, error } = useDataQuery<{
		ds: {
			entries: Fields extends keyof DataType
				? Pick<DataType, Fields>[]
				: DataType[];
		};
	}>(datastoreQuery, {
		variables: {
			namespace,
			fields: fields?.join(",") ?? ".",
		},
	});

	return {
		data: data?.ds?.entries,
		loading,
		error,
	};
}
