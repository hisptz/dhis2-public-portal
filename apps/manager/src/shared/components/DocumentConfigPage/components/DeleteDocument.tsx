import React from "react";
import { useLibrary } from "../../LibraryProvider";
import { useDialog } from "@hisptz/dhis2-ui";
import { Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { FetchError, useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useRefreshLibraries } from "../../LibrariesProvider";

const deleteMutation: any = {
	type: "delete",
	resource: `dataStore/${DatastoreNamespaces.MODULES}`,
	id: ({ id }: { id: string }) => id,
};

export function DeleteLibrary() {
	const navigate = useNavigate({
		from: "/library/$libraryId/edit",
	});
	const [onDelete, { loading }] = useDataMutation(deleteMutation);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const library = useLibrary();
	const refreshLibraries = useRefreshLibraries();
	const { confirm } = useDialog();

	const handleDelete = () => {
		confirm({
			title: i18n.t("Delete library"),
			loadingText: i18n.t("Deleting..."),
			confirmButtonText: i18n.t("Delete"),
			onConfirm: async () => {
				try {
					await onDelete({ id: library.id });
					await refreshLibraries();
					show({
						message: i18n.t("Library deleted successfully"),
						type: { success: true },
					});
					navigate({
						to: "/library",
					});
				} catch (e) {
					if (e instanceof Error || e instanceof FetchError) {
						show({
							message: `${i18n.t("Could not delete library")}: ${e.message}`,
							type: { critical: true },
						});
					}
				}
			},
			position: "middle",
			message: (
				<span>
					{i18n.t("Are you sure you want to delete the library ")}
					<b>{library.label}</b>?{" "}
					{i18n.t("This action is irreversible")}
				</span>
			),
		});
	};

	return (
		<>
			<Button loading={loading} onClick={handleDelete}>
				{loading ? i18n.t("Deleting...") : i18n.t("Delete library")}
			</Button>
		</>
	);
}
