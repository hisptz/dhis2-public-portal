import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	BaseSectionConfig,
	baseSectionSchema,
	SectionDisplay,
	SectionType,
} from "@packages/shared/schemas";
import { startCase } from "lodash";
import { SectionIDField } from "./SectionIDField";
import { FetchError, useAlert } from "@dhis2/app-runtime";
import { useUpdateModule } from "../../hooks/save";

export function AddSectionForm({
	sortOrder,
	hide,
	onClose,
	onAdd,
}: {
	sortOrder: number;
	hide: boolean;
	onClose: () => void;
	onAdd: (section: BaseSectionConfig) => void;
}) {
	const { updateModule } = useUpdateModule();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<BaseSectionConfig>({
		resolver: zodResolver(baseSectionSchema),
		defaultValues: {
			sortOrder,
		},
	});

	const onSubmit = async (data: BaseSectionConfig) => {
		try {
			onAdd(data);
			show({
				message: i18n.t("Section created successfully"),
				type: { success: true },
			});
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

	const displayType = useWatch({ name: "sectionDisplay" });

	const options = Object.values(SectionType).map((type) => {
		return {
			label: i18n.t(startCase(type.toLowerCase())),
			value: type,
		};
	});

	const filteredOptions = options.filter((option) => {
		return displayType == SectionDisplay.HORIZONTAL
			? option.value == SectionType.SINGLE_ITEM
			: true;
	});

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Create Section")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<SectionIDField />
						<RHFTextInputField
							required
							name="title"
							label={i18n.t("Title")}
						/>
						<RHFSingleSelectField
							required
							disabled={displayType == undefined}
							label={i18n.t("Type")}
							placeholder={i18n.t("Select type")}
							options={filteredOptions}
							name="type"
							helpText={
								!displayType &&
								i18n.t(
									"Please select the display type of this section first",
								)
							}
						/>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							primary
							onClick={(_, e) => form.handleSubmit(onSubmit)(e)}
						>
							{form.formState.isSubmitting
								? i18n.t("Creating...")
								: i18n.t("Create section")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
