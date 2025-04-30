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
import { LibraryGroupData, libraryGroupSchema } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { LibraryGroupTypeSelector } from "./LibraryGroupTypeSelector";
import { RHFIDField } from "../../../../Fields/IDField";

export function LibraryGroupForm({
	hide,
	onClose,
	group,
	onSave,
	nested,
}: {
	hide: boolean;
	onClose: () => void;
	group?: LibraryGroupData;
	onSave: (group: LibraryGroupData) => void;
	nested?: boolean;
}) {
	const form = useForm<LibraryGroupData>({
		defaultValues: group ?? {},
		mode: "onChange",
		resolver: zodResolver(libraryGroupSchema),
	});
	const editMode = !!group;
	const title = editMode
		? i18n.t("Edit Library Group")
		: i18n.t("Add Library Group");
	const buttonLabel = editMode ? i18n.t("Update") : i18n.t("Save");

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
							required
							name="label"
							label={i18n.t("Title")}
						/>
						<RHFIDField
							name="id"
							label={i18n.t("ID")}
							dependsOn="label"
						/>
						<LibraryGroupTypeSelector nested={nested} />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							primary
							onClick={(_, e) => form.handleSubmit(onSave)(e)}
						>
							{buttonLabel}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
