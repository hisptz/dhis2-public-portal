import { DATASTORE_LIBRARIES_NAMESPACE } from "@health-portal/shared/constants";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { useRefreshLibrary } from "../../LibraryProvider";
import { LibraryData } from "@health-portal/shared/schemas";

const mutation: any = {
	type: "update",
	resource: `dataStore/${DATASTORE_LIBRARIES_NAMESPACE}`,
	id: ({ id }: { id: string }) => id,
	data: ({ data }: { data: LibraryData }) => data,
};

export function useSaveLibrary() {
	const refresh = useRefreshLibrary();
	const { libraryId } = useParams({
		from: "/library/_provider/$libraryId/_formProvider/edit/",
	});
	const navigate = useNavigate();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [mutate, rest] = useDataMutation(mutation, {
		variables: {
			id: libraryId,
		},
		onComplete: async () => {
			show({
				message: i18n.t("Changes saved successfully"),
				type: { success: true },
			});
			await refresh();
			navigate({
				to: "/library",
			});
		},
		onError: (error) => {
			show({
				message: `${i18n.t("Could not save changes")}: ${error.message}`,
				type: { critical: true },
			});
		},
	});

	const save = async (data: LibraryData) => {
		return await mutate({ data: data });
	};

	return {
		save,
		...rest,
	};
}
