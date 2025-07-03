import React, { useCallback } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Divider, IconDelete16 } from "@dhis2/ui";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { DocumentItem, DocumentsModule } from "@packages/shared/schemas";
import { DocumentItemListConfig } from "./DocumentItemList";
import { AddDocumentButton } from "./AddDocument/AddDocumentButton";
import { SortDocument } from "./SortDocument/SortDocument";

export function DocumentItemConfig() {
	const { setValue, getValues } = useFormContext<DocumentsModule>();
	const hasGroups = useWatch<DocumentsModule, "config.grouped">({
		name: "config.grouped",
	});

	const { fields, append, remove, replace } = useFieldArray<
		DocumentsModule,
		"config.items"
	>({
		name: "config.items",
		keyName: "fieldId" as unknown as "id",
	});

	const onAddDocument = useCallback(
		(Document: DocumentItem) => {
			append(Document);
		},
		[append, getValues, setValue],
	);

	if (hasGroups) {
		return null;
	}

	const rows = fields.map((field, index) => {
		return {
			...field,
			actions: (
				<ButtonStrip key={field.id}>
					<Button
						onClick={() => remove(index)}
						title={i18n.t("Remove")}
						icon={<IconDelete16 />}
					/>
				</ButtonStrip>
			),
		};
	});

	const handleSortSubmit = (sortedItems: DocumentItem[]) => {
		replace(sortedItems);
	};

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Documents")}</h3>
				<ButtonStrip end>
					<SortDocument items={fields} onSortSubmit={handleSortSubmit} />
					<AddDocumentButton onAdd={onAddDocument} sortOrder={fields.length + 1}/>
				</ButtonStrip>
			</div>
			<Divider />
			<DocumentItemListConfig Documents={rows} />
		</div>
	);
}
