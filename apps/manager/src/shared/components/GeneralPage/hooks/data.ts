import {
	useAlert,
	useDataEngine,
	useDataMutation,
	useDataQuery,
} from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import {
	AppIconFile,
	MetadataConfig,
	MetadataForm,
	metadataFormSchema,
} from "@packages/shared/schemas";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import i18n from "@dhis2/d2-i18n";
import { set } from "lodash";
import { useMetadata } from "../providers/GeneralProvider";
import { useManageDocument } from "../../../hooks/document";

const query = {
	metadata: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.METADATA}`,
		params: {
			fields: ".",
		},
	},
};
const fileQuery = {
	icon: {
		resource: `documents`,
		id: ({ icon }) => icon,
	},
};

type Response = {
	metadata: MetadataConfig;
};

export function useMetadataQuery() {
	const engine = useDataEngine();
	const { refetch, data, ...rest } = useDataQuery<Response>(query, {
		lazy: true,
	});
	const form = useForm<MetadataForm>({
		defaultValues: async () => {
			const response = (await refetch()) as { metadata: MetadataConfig };
			const file = response.metadata.icon
				? ((await engine.query(fileQuery, {
						variables: {
							icon: response.metadata.icon,
						},
					})) as { icon: { displayName: string; id: string } })
				: undefined;

			return {
				...response.metadata,
				icon: file
					? new AppIconFile(
							[],
							`${file?.icon?.displayName.replace(`[public-portal] `, ``)}`,
							{
								type: "image/png",
							},
						).setId(file.icon.id)
					: undefined,
			} as MetadataForm;
		},
		resolver: zodResolver(metadataFormSchema),
	});

	return {
		...rest,
		form,
		refetch,
		config: data?.metadata,
		loading: rest.loading || form.formState.isLoading,
	};
}

const dataMutation = {
	type: "update" as const,
	id: DatastoreKeys.METADATA,
	resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
	data: ({ data }: { data: MetadataConfig }) => data,
};

export function useSaveMetadata() {
	const config = useMetadata();
	const { create: createIcon } = useManageDocument();
	const { reset } = useFormContext<MetadataForm>();
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

	const generateIcons = async (data: MetadataForm) => {
		const iconId = await createIcon(data.icon);
		return {
			icon: iconId,
			icons: [],
		};
	};

	const save = async (data: MetadataForm) => {
		try {
			const updatedData = {
				...config,
				...data,
				icon: config.icon,
				icons: config.icons,
			};
			if (data.icon.size > 0) {
				//Means a new file has been uploaded
				const { icon, icons } = await generateIcons(data);
				set(updatedData, "icon", icon);
				set(updatedData, "icons", icons);
			}
			await mutate({ data: updatedData });
			show({
				message: i18n.t("Changes saved successfully"),
				type: { success: true },
			});
			reset(
				{},
				{
					keepDirty: true,
				},
			);
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
