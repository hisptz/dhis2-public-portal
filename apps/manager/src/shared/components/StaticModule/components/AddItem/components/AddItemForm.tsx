import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { FetchError, useAlert } from "@dhis2/app-runtime";
import {
	StaticItemConfig,
	staticItemSchema,
	StaticModule,
} from "@packages/shared/schemas";
import { RHFIDField } from "../../../../Fields/IDField";
import { useCreateItem } from "../hooks/create";
import { useModule } from "../../../../ModulesPage/providers/ModuleProvider";
import { useSaveModule } from "../../../hooks/namespace";

export interface AddItemFormProps {
	hide: boolean;
	onClose: () => void;
	onComplete: (item: StaticItemConfig) => void;
	sortOrder: number;
}

export function AddItemForm({
	hide,
	onClose,
	onComplete,
	sortOrder,
}: AddItemFormProps) {
	const { createItem } = useCreateItem();
	const module = useModule() as StaticModule;
	const { save } = useSaveModule(module.id);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<StaticItemConfig>({
		resolver: zodResolver(staticItemSchema),
		shouldFocusError: false,
		defaultValues: {
			content: "",
			icon: "",
			shortDescription: "",
			sortOrder,
		},
	});

	const onSave = async (data: StaticItemConfig) => {
		try {
			if (!module?.config?.namespace) {
				module.config = {
					...module.config,
					namespace: `hisptz-public-portal-${module?.id}`,
				};
				await save(module);
			}
			const itemWithSortOrder = { ...data, sortOrder };
			await createItem(itemWithSortOrder);
			show({
				message: i18n.t("Item created successfully"),
				type: { success: true },
			});
			onComplete(itemWithSortOrder);
			onClose();
		} catch (e) {
			if (e instanceof FetchError || e instanceof Error) {
				show({
					message: `${i18n.t("Could not create new item")}: ${e.message ?? e.toString()}`,
					type: { critical: true },
				});
			}
		}
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Create an item")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							required
							name="title"
							label={i18n.t("Title")}
						/>
						<RHFIDField label="ID" name="id" dependsOn="title" />
						{/* <input type="hidden" {...form.register("sortOrder")} /> */}
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							primary
							onClick={(_, e) => form.handleSubmit(onSave)(e)}
						>
							{form.formState.isSubmitting
								? i18n.t("Creating...")
								: i18n.t("Create item")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}