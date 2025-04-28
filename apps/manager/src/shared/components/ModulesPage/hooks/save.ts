import { useNavigate } from "@tanstack/react-router";
import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppModule } from "@packages/shared/schemas";
import { useRefreshModule } from "../providers/ModuleProvider";

const mutation: any = {
	type: "update",
	resource: `dataStore/${DatastoreNamespaces.MODULES}`,
	id: ({ id }: { id: string }) => id,
	data: ({ data }: { data: AppModule }) => data,
};

export function useSaveModule(moduleId: string) {
	const refresh = useRefreshModule();
	const navigate = useNavigate();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
 	const [mutate, rest] = useDataMutation(mutation, {
		variables: {
			id: moduleId,
		},
		onComplete: async () => {
			show({
				message: i18n.t("Changes saved successfully"),
				type: { success: true },
			});
			await refresh();
			navigate({
				to: "/modules",
			});
		},
		onError: (error) => {
			show({
				message: `${i18n.t("Could not save changes")}: ${error.message}`,
				type: { critical: true },
			});
		},
	});

	const save = async (data: AppModule) => {
		return await mutate({ data });
	};

	return {
		save,
		...rest,
	};
}
