import { useAlert, useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { MetadataConfig, metadataSchema } from "@packages/shared/schemas";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import i18n from "@dhis2/d2-i18n";

const query = {
	metadata: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.METADATA}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	metadata: MetadataConfig;
};

export function useMetadataQuery() {
	const { refetch, ...rest } = useDataQuery<Response>(query, {
		lazy: true,
	});
	const form = useForm<MetadataConfig>({
		defaultValues: async () => {
			const response = await refetch();
			return response.metadata as MetadataConfig;
		},
		resolver: zodResolver(metadataSchema),
	});

	return {
		form,
		refetch,
		...rest,
	};
}

const dataMutation = {
	type: "update" as const,
	id: DatastoreKeys.METADATA,
	resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
	data: ({ data }: { data: MetadataConfig }) => data,
};

export function useSaveMetadata() {
	const { reset } = useFormContext();
	const [mutate, rest] = useDataMutation(dataMutation, {
		onError: (error) => {
			show({
				message: `${i18n.t("Error saving changes")}:${error.message}`,
				type: { critical: true },
			});
		},
	});
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const save = async (data: MetadataConfig) => {
		try {
			await mutate({ data });
			show({
				message: i18n.t("Changes saved successfully"),
				type: { success: true },
			});
			reset();
		} catch (e) {
			//An error has already been printed out in use data mutation callbacks
			console.error(e);
		}
	};

	return {
		save,
		...rest,
	};
}
