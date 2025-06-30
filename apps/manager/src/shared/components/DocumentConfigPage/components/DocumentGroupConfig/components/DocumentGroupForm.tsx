import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import { DocumentGroup, documentGroupSchema } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { RHFIDField } from "../../../../Fields/IDField";
import { DocumentGroupTypeSelector } from "../../DocumentGroupSelector";

export function DocumentGroupForm({
	hide,
	onClose,
	group,
	onSave,
	nested,
}: {
	hide: boolean;
	onClose: () => void;
	group?: DocumentGroup;
	onSave: (group: DocumentGroup) => void;
	nested?: boolean;
}) {
	const form = useForm<DocumentGroup>({
		defaultValues: group ?? {
			items: [],
		},
		mode: "onChange",
		resolver: zodResolver(documentGroupSchema),
	});
	const editMode = !!group;
	const title = editMode
		? i18n.t("Edit document group")
		: i18n.t("Add document group");
	const buttonLabel = editMode ? i18n.t("Update") : i18n.t("Save");

	const handleSave = (data: DocumentGroup) => {
		onSave(data);
		onClose();
	};
	const err = (err) => {
		console.log(err);
	};
	return (
		<FormProvider {...form}>
			<Modal
				small={nested}
				position="middle"
				onClose={onClose}
				hide={hide}
			>
				<ModalTitle>{title}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							dataTest={"document-group-title-input"}
							required
							name="title"
							label={i18n.t("Title")}
						/>
						<RHFIDField
							name="id"
							label={i18n.t("ID")}
							dependsOn="title"
						/>
						<DocumentGroupTypeSelector />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							dataTest={"save-document-group-button"}
							primary
							onClick={(_, e) =>
								form.handleSubmit(handleSave, err)(e)
							}
						>
							{buttonLabel}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
