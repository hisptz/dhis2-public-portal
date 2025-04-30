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
import { StaticItemConfig, staticItemSchema } from "@packages/shared/schemas";
import { RHFIDField } from "../../../../Fields/IDField";
import { useCreateItem } from "../hooks/create";

export function AddItemForm({
	hide,
	onClose,
	onComplete,
}: {
	hide: boolean;
	onClose: () => void;
	onComplete: (item: StaticItemConfig) => void;
}) {
	const { createItem } = useCreateItem();
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
		},
	});

	const onSave = async (data: StaticItemConfig) => {
		try {
			await createItem(data);
			show({
				message: i18n.t("Module created successfully"),
				type: { success: true },
			});
			onComplete(data);
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
