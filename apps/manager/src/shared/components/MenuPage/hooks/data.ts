import { useAlert, useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { AppMenuConfig } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { useFormContext } from "react-hook-form";
import { useRefreshMenuConfig } from "../providers/MenuProvider";

const query = {
	menu: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${DatastoreKeys.MENU}`,
		params: {
			fields: ".",
		},
	},
};

type Response = {
	menu: AppMenuConfig;
};

export function useMenuQuery() {
	const { data, ...rest } = useDataQuery<Response>(query);

	return {
		menu: data?.menu,
		...rest,
	};
}

const mutation = {
	type: "update" as const,
	id: DatastoreKeys.MENU,
	resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
	data: ({ data }: { data: AppMenuConfig }) => data,
};

export function useSaveMenuConfig() {
	const refresh = useRefreshMenuConfig();
	const { reset } = useFormContext();
	const [mutate, rest] = useDataMutation(mutation, {
		onComplete: () => {
			show({
				message: i18n.t("Changes saved successfully"),
				type: { success: true },
			});
		},
		onError: (error) => {
			show({
				message: `${i18n.t("Error saving changes")}: ${error.message}`,
				type: { critical: true },
			});
		},
	});
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const save = async (data: AppMenuConfig) => {
		try {
			await mutate({ data });
			await refresh();
			reset(data, { keepDirtyValues: true });
		} catch (e) {
			console.error(e);
		}
	};

	return {
		save,
		...rest,
	};
}
