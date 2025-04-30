import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DocumentsModule, documentsModuleSchema } from "@packages/shared/schemas";
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
import { LibraryIDField } from "./LibraryIDField";
import { useCreateLibrary } from "../hooks/library";
import { FetchError, useAlert } from "@dhis2/app-runtime";

export function AddLibraryForm({
	sortOrder,
	hide,
	onClose,
	onComplete,
}: {
	sortOrder: number;
	hide: boolean;
	onClose: () => void;
	onComplete: (library: DocumentsModule) => void;
}) {
	const { createLibrary } = useCreateLibrary();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<DocumentsModule>({
		resolver: zodResolver(documentsModuleSchema),
		mode: "onChange",
		shouldFocusError: false,
		defaultValues: {
			groups: [],
			sortOrder,
		},
	});

	const onSave = async (data: DocumentsModule) => {
		try {
			await createLibrary(data);
			show({
				message: i18n.t("Library created successfully"),
				type: { success: true },
			});
			onComplete(data);
			onClose();
		} catch (e) {
			if (e instanceof FetchError || e instanceof Error) {
				show({
					message: `${i18n.t("Could not create new library")}: ${e.message ?? e.toString()}`,
					type: { critical: true },
				});
			}
			console.error(e);
		}
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Create Library")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							required
							name="label"
							label={i18n.t("Title")}
						/>
						<LibraryIDField />
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
								: i18n.t("Create library")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
