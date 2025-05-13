import React from "react";
import { useController } from "react-hook-form";
import { AppMenuConfig, MenuPosition } from "@packages/shared/schemas";
import { Field, Radio } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";

export function MenuPositionConfig() {
	const { field, fieldState } = useController<AppMenuConfig, "position">({
		name: "position",
	});
	return (
		<>
			<Field
				{...field}
				required
				validationText={fieldState?.error?.message}
				name="position"
				error={!!fieldState.error}
				label={i18n.t("Menu Position")}
			>
				<div className="flex gap-4 items-center">
					<Radio
						onChange={({ checked }) => {
							if (checked) {
								field.onChange(MenuPosition.SIDEBAR);
							}
						}}
						checked={field.value === MenuPosition.SIDEBAR}
						label={i18n.t("Sidebar")}
						value={MenuPosition.SIDEBAR}
					/>
					<Radio
						onChange={({ checked }) => {
							if (checked) {
								field.onChange(MenuPosition.HEADER);
							}
						}}
						checked={field.value === MenuPosition.HEADER}
						label={i18n.t("Header")}
						value={MenuPosition.HEADER}
					/>
				</div>
			</Field>
			{field.value === MenuPosition.SIDEBAR && (
				<RHFCheckboxField
					label={i18n.t("Collapsible")}
					name={"collapsible"}
				/>
			)}
		</>
	);
}
