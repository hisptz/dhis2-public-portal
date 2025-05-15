import React, { useEffect } from "react";
import { RHFCheckboxField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { Field, Radio } from "@dhis2/ui";
import { ItemsDisplay, VisualizationModule } from "@packages/shared/schemas";
import { startCase } from "lodash";

export function DashboardGeneralConfig() {
	const { field, fieldState } = useController<
		VisualizationModule,
		"config.groupDisplay"
	>({
		name: "config.groupDisplay",
	});
	const { setValue, getValues } = useFormContext();
	useEffect(() => {
		const currentGrouped = getValues("config.grouped");
		if (
			currentGrouped === undefined ||
			currentGrouped === null ||
			currentGrouped === ""
		) {
			setValue("config.grouped", false);
		}
	}, [setValue, getValues]);

	const isGrouped = useWatch<VisualizationModule, "config.grouped">({
		name: "config.grouped",
	});

	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFTextInputField
				required
				name="config.title"
				label={i18n.t("Title")}
			/>
			{!isGrouped && (
				<div>
					<RHFRichTextAreaField
						required
						autoGrow
						rows={2}
						name="config.shortDescription"
						label={i18n.t("Short description")}
					/>
					<RHFRichTextAreaField
						required
						name="config.description"
						label={i18n.t("Description")}
					/>
				</div>
			)}
			<RHFCheckboxField
				name="config.grouped"
				label={i18n.t("Has groups")}
			/>
			{isGrouped && (
				<div className="my-2">
					<Field
						{...field}
						validationText={fieldState?.error?.message}
						name="config.groupDisplay"
						error={!!fieldState.error}
						label={i18n.t("Group selector")}
					>
						<div className="flex gap-4 items-center">
							{Object.values(ItemsDisplay).map((type) => (
								<Radio
									onChange={({ checked }) => {
										if (checked) {
											field.onChange(type);
										}
									}}
									checked={field.value === type}
									label={i18n.t(
										startCase(type.toLowerCase()),
									)}
									value={type}
								/>
							))}
						</div>
					</Field>
				</div>
			)}
		</div>
	);
}
