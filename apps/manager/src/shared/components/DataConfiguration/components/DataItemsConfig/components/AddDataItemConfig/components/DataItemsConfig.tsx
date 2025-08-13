import React from "react";
import { ButtonStrip, Chip, Field } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { ManualDataItem } from "./ManualDataItem";
import { useController, useFieldArray } from "react-hook-form";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";

export function DataItemsConfig({}: {}) {
	const { fieldState } = useController<
		DataServiceDataSourceItemsConfig,
		"dataItems"
	>({
		name: "dataItems",
	});
	const { fields, append, remove } = useFieldArray<
		DataServiceDataSourceItemsConfig,
		"dataItems"
	>({
		name: "dataItems",
		keyName: "fieldId" as unknown as "id",
	});
	return (
		<Field
			validationText={fieldState.error?.message}
			error={!!fieldState.error}
			label={i18n.t("Data items")}
		>
			<ButtonStrip end>
				<ManualDataItem onAdd={append} />
			</ButtonStrip>
			<div className="flex-1 flex flex-wrap gap-4">
				{fields.map((item, index) => {
					return (
						<Chip
							onRemove={() => {
								remove(index);
							}}
							key={item.id}
						>
							{item.sourceId}:{item.id}
						</Chip>
					);
				})}
			</div>
		</Field>
	);
}
