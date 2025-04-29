import React, { useState } from "react";
import { Button, Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { FetchError, useAlert, useDataMutation, } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-router";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { useModule } from "../providers/ModuleProvider";
import { useRefreshModules } from "../providers/ModulesProvider";
import { AppModule, ModuleType, StaticModuleConfig } from "@packages/shared/schemas";

const deleteMutation: any = {
	type: "delete",
	resource: `dataStore/${DatastoreNamespaces.MODULES}`,
	id: ({ id }: { id: string }) => id,
};

const deleteNamespaceMutation: any = (namespace: string) => ({
	type: "delete",
	resource: `dataStore/${namespace}`,
});

export function DeleteModule() {
	const [showDialog, setShowDialog] = useState(false);
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit",
	});
	const module = useModule() as AppModule;
	const [onDelete, { loading }] = useDataMutation(deleteMutation);
	const [deleteNamespace] = useDataMutation(
		module.type === ModuleType.STATIC && (module.config as StaticModuleConfig).namespace
			? deleteNamespaceMutation((module.config as StaticModuleConfig).namespace)
			: { type: "delete", resource: "" }
	);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const refreshModules = useRefreshModules();

	const handleDelete = () => {
		setShowDialog(true);
	};

	const onConfirm = async () => {
		try {
			await onDelete({ id: module.id });
			if (
				module.type === ModuleType.STATIC &&
				(module.config as StaticModuleConfig).namespace
			) {
				const namespace = (module.config as StaticModuleConfig).namespace;
				await deleteNamespace({ namespace });
			}
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
							<b>{module?.config?.title}</b>? {i18n.t("This action is irreversible")}
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
