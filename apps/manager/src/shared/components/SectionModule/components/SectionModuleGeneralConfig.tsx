import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import {
	MenuPosition,
	SectionDisplay,
	SectionModuleConfig,
} from "@packages/shared/schemas";
import { Field, Radio } from "@dhis2/ui";
import { useController } from "react-hook-form";

export function SectionModuleGeneralConfig() {
	const { field, fieldState } = useController<
		SectionModuleConfig,
		"sectionDisplay"
	>({
		name: "sectionDisplay",
	});
	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<Field
				{...field}
				required
				validationText={fieldState?.error?.message}
				name="sectionDisplay"
				error={!!fieldState.error}
				label={i18n.t("Display type")}
			>
				<div className="flex gap-4 items-center">
					<Radio
						onChange={({ checked }) => {
							if (checked) {
								field.onChange(SectionDisplay.VERTICAL);
							}
						}}
						checked={field.value === SectionDisplay.VERTICAL}
						label={i18n.t("Vertical")}
						value={MenuPosition.SIDEBAR}
					/>
					<Radio
						onChange={({ checked }) => {
							if (checked) {
								field.onChange(SectionDisplay.HORIZONTAL);
							}
						}}
						checked={field.value === SectionDisplay.HORIZONTAL}
						label={i18n.t("Horizontal")}
						value={MenuPosition.HEADER}
					/>
				</div>
			</Field>
		</div>
	);
}
