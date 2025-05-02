import { useFormContext } from "react-hook-form";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FetchError, useAlert, useDataMutation } from "@dhis2/app-runtime";
import { StaticItemConfig, StaticModule } from "@packages/shared/schemas";
import { useSaveItem } from "../hooks/save";
import { useModule } from "../../ModulesPage/providers/ModuleProvider";
import { useRefreshModules } from "../../ModulesPage/providers/ModulesProvider";

const deleteMutation: any = (namespace: string) => ({
	type: "delete",
	resource: `dataStore/${namespace}`,
	id: ({ itemId }: { itemId: string }) => itemId,
});

export function ItemActions() {
	const { itemId } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/static/$itemId/",
	});
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/static/$itemId",
	});
	const { save } = useSaveItem(itemId!);
	const module = useModule() as StaticModule;
	const [onDelete, { loading }] = useDataMutation(
		deleteMutation(module?.config?.namespace),
	);
	const refreshModules = useRefreshModules();
	const [showDialog, setShowDialog] = useState(false);
	const { handleSubmit, formState } = useFormContext<StaticItemConfig>();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onError = () => {
		show({
			message: i18n.t("Please fix the validation errors before saving"),
			type: { critical: true },
		});
	};
	const handleDelete = () => {
		setShowDialog(true);
	};

	const onSubmit = async (data: StaticItemConfig) => {
		try {
			await save(data);
			navigate({ to: "/modules/$moduleId/edit" });
		} catch (error) {
			show({
				message: i18n.t("Error: {{error}}", { error: error.message }),
				type: { critical: true },
			});
		}
	};

	const onConfirm = async () => {
		if (!module || !module?.config?.namespace || !itemId) {
			show({
				message: i18n.t(
					"Cannot delete item: Missing module or item information",
				),
				type: { critical: true },
			});
			setShowDialog(false);
			return;
		}

		try {
			await onDelete({ itemId });
			await refreshModules();
			show({
				message: i18n.t("Item deleted successfully"),
				type: { success: true },
			});
			navigate({
				to: "/modules/$moduleId/edit",
				params: { moduleId: module.id },
			});
		} catch (e) {
			const error = e as Error | FetchError;
			show({
				message: `${i18n.t("Could not delete item")}: ${error.message}`,
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
			<ButtonStrip end>
				<Button loading={loading} onClick={handleDelete} secondary>
					{loading ? i18n.t("Deleting...") : i18n.t("Delete item")}
				</Button>
				<Button
					onClick={() => navigate({ to: "/modules/$moduleId/edit" })}
				>
					{i18n.t("Cancel")}
				</Button>
				<Button
					primary
					loading={formState.isSubmitting}
					disabled={!formState.isDirty || formState.isSubmitting}
					onClick={() => {
						handleSubmit(onSubmit, onError)();
					}}
				>
					{i18n.t("Save changes")}
				</Button>
			</ButtonStrip>
			{showDialog && (
				<Modal position="middle" onClose={onCancel}>
					<ModalTitle>{i18n.t("Delete item")}</ModalTitle>
					<ModalContent>
						<span>
							{i18n.t(
								"Are you sure you want to delete the item ",
							)}
							? {i18n.t("This action is irreversible")}
						</span>
					</ModalContent>
					<ModalActions>
						<ButtonStrip>
							<Button onClick={onCancel}>
								{i18n.t("Cancel")}
							</Button>
							<Button
								destructive
								onClick={onConfirm}
								loading={loading}
							>
								{i18n.t("Delete")}
							</Button>
						</ButtonStrip>
					</ModalActions>
				</Modal>
			)}
		</>
	);
}
