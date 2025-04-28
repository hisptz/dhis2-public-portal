import React, { useState } from "react";
import { Button, Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { FetchError, useAlert, useDataMutation, } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-router";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { useModule } from "../../ModulesPage/providers/ModuleProvider";
import { useRefreshModules } from "../../ModulesPage/providers/ModulesProvider";
import { VisualizationModule } from "@packages/shared/schemas";

const deleteMutation: any = {
	type: "delete",
	resource: `dataStore/${DatastoreNamespaces.MODULES}`,
	id: ({ id }: { id: string }) => id,
};


export function DeleteDashboard() {
	const [showDialog, setShowDialog] = useState(false);
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit",
	});
	const [onDelete, { loading }] = useDataMutation(deleteMutation);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const module = useModule() as VisualizationModule;
	const refreshModules = useRefreshModules();

	const handleDelete = () => {
		setShowDialog(true);
	};

	const onConfirm = async () => {
		try {
			await onDelete({ id: module.id });
			await refreshModules();
			show({
				message: i18n.t("Module deleted successfully"),
				type: { success: true },
			});
			navigate({ to: "/modules" });
		} catch (e) {
			const error = e as Error | FetchError;
			show({
				message: `${i18n.t("Could not delete module")}: ${error.message}`,
				type: { critical: true },
			});
		}
		setShowDialog(false);
	};

	const onCancel = () => {
		setShowDialog(false);
	};

	return (
		<>
			<Button loading={loading} onClick={handleDelete} secondary>
				{loading ? i18n.t("Deleting...") : i18n.t("Delete module")}
			</Button>
			{showDialog && (
				<Modal position="middle" onClose={onCancel}>
					<ModalTitle>{i18n.t("Delete module")}</ModalTitle>
					<ModalContent>
						<span>
							{i18n.t("Are you sure you want to delete the module ")}
							<b>{module.config.title}</b>? {i18n.t("This action is irreversible")}
						</span>
					</ModalContent>
					<ModalActions>
						<ButtonStrip>
							<Button onClick={onCancel}>{i18n.t("Cancel")}</Button>
							<Button destructive onClick={onConfirm} loading={loading}>
								{i18n.t("Delete")}
							</Button>
						</ButtonStrip>
					</ModalActions>
				</Modal>
			)}
		</>
	);
}
