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
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";
import { useCreateLibrary } from "../hooks/document";
import { FetchError, useAlert } from "@dhis2/app-runtime";
import { DocumentItem, documentItemSchema } from "@packages/shared/schemas";
import { RHFFileInputField } from "../../../../Fields/RHFFileInputField";
import { RHFIDField } from "../../../../Fields/IDField";
import { useManageDocument } from "../../../../../hooks/document";
import { CustomFile } from "../../DocumentGroupConfig/components/FilesListForm/components/FileForm/hooks/file";
import { z } from "zod";
import { omit } from "lodash";

type Props = {
	hide: boolean;
	onClose: () => void;
	onSubmit: (visualization: DocumentItem) => void;
	documentItem?: DocumentItem;
};

const documentPayloadSchema = documentItemSchema.extend({
	file: z.instanceof(File),
});

type DocumentItemPayload = z.infer<typeof documentPayloadSchema>;

export function AddDocumentForm({
	hide,
	onClose,
	onSubmit,
	documentItem,
	// onComplete,
}: Props) {
	const { createLibrary } = useCreateLibrary();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	// TODO add default file when editing
	const form = useForm<DocumentItemPayload>({
		resolver: zodResolver(documentPayloadSchema),
		mode: "onChange",
		shouldFocusError: false,
		defaultValues: {
			...documentItem,
		},
	});

	const { create: uploadDocument } = useManageDocument();

	const onAdd = (visualization: DocumentItem) => {
		onSubmit(visualization);
		onClose();
	};

	const onError = (error: any) => {
		if (error instanceof FetchError || error instanceof Error) {
			show({
				message: `${i18n.t("Could not create new library")}: ${error.message ?? error.toString()}`,
				type: { critical: true },
			});
		}
		console.error(error);
	};

	const onSave = async (data: DocumentItemPayload) => {
		try {
			if (!(data.file instanceof CustomFile)) {
				const id = await uploadDocument(data.file);
				data = {
					...data,
					id,
				};
			}

			if (data.id) {
				onAdd(omit(data, "file"));
				show({
					message: i18n.t("File uploaded successfully"),
					type: { success: true },
				});
				onClose();
			} else {
				show({
					message: i18n.t("Could not save the file!"),
					type: { critical: true },
				});
			}
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
				<ModalTitle>{i18n.t("Create Item")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							required
							name="label"
							label={i18n.t("Label")}
						/>
						<RHFIDField name="id" label="ID" dependsOn="label" />
						<RHFSingleSelectField
							required
							options={[
								{
									label: i18n.t("PDF"),
									value: "PDF",
								},
							]}
							name={"type"}
							label={i18n.t("File type")}
						/>
						<RHFFileInputField
							required
							name={"file"}
							accept="application/pdf"
							label={i18n.t("File")}
						/>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							primary
							onClick={(_, e) =>
								form.handleSubmit(onSave, onError)(e)
							}
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
