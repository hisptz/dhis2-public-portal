import { useController, useFieldArray, useWatch } from "react-hook-form";
import { MenuItem } from "@packages/shared/schemas";
import { ButtonStrip, Field } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { SubMenuItem } from "./SubMenuItem";
import { AddSubMenuItem } from "./AddSubMenuItem";
import { isEmpty } from "lodash";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { MenuPathInput } from "./MenuPathInput";

export function ModulesSelector() {
	const { fieldState } = useController<MenuItem, "items">({
		name: "items",
	});
	const parentPath = useWatch<MenuItem, "path">({
		name: "path",
	});
	const { fields, remove, update, append } = useFieldArray<MenuItem, "items">(
		{
			name: "items",
		},
	);

	return (
		<>
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<MenuPathInput />
			<Field
				error={!!fieldState.error}
				validationText={fieldState.error?.message}
				required
				label={i18n.t("Menu items")}
			>
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap gap-2">
						{isEmpty(fields) && (
							<span className="text-gray-400 text-md p-8 self-center m-auto">
								{i18n.t("There are no sub menus defined")}
							</span>
						)}
						{fields.map((item, index) => {
							return (
								<SubMenuItem
									onUpdate={(data) => update(index, data)}
									onRemove={() => remove(index)}
									parentPath={parentPath}
									key={item.id}
									item={item}
								/>
							);
						})}
					</div>
					<ButtonStrip end>
						<AddSubMenuItem
							onAdd={append}
							parentPath={parentPath}
							sortOrder={fields.length + 1}
						/>
					</ButtonStrip>
				</div>
			</Field>
		</>
	);
}
