import { Field, Radio } from "@dhis2/ui";
import React from "react";
import { MenuItem, MenuItemType } from "@packages/shared/schemas";
import { capitalize, snakeCase } from "lodash";
import { useController } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";

export function MenuTypeInput() {
	const { field, fieldState } = useController<MenuItem, "type">({
		name: "type",
	});

	return (
		<Field
			label={i18n.t("Type")}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
		>
			<div className="flex gap-2 w-full">
				{Object.values(MenuItemType).map((type) => (
					<Radio
						onChange={({ checked }) => {
							if (checked) {
								field.onChange(type);
							}
						}}
						checked={field.value === type}
						name="type"
						value={field.value}
						label={capitalize(snakeCase(type))}
						key={type}
					/>
				))}
			</div>
		</Field>
	);
}
