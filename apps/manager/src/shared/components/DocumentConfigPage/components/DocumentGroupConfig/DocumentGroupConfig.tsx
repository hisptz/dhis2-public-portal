import React, { useMemo } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { DocumentGroup, DocumentsModule } from "@packages/shared/schemas";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ButtonStrip, Field } from "@dhis2/ui";
import { AddDocumentGroup } from "./components/AddDocumentGroup";
import { EditDocumentGroup } from "./components/EditDocumentGroup";
import { DeleteDocumentGroup } from "./components/DeleteDocumentGroup";
import { SortDocumentGroup } from "./components/SortDocumentGroup/SortDocumentGroup";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Group"),
		key: "title",
	},

	{
		label: i18n.t("Files"),
		key: "files",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function DocumentGroupConfig() {
	const hasGroups = useWatch<DocumentsModule, "config.grouped">({
		name: "config.grouped",
	});
	const { fields, append, update, remove, replace } = useFieldArray<
		DocumentsModule,
		"config.groups"
	>({
		name: "config.groups",
		keyName: "key" as unknown as "id",
	});

	const rows = useMemo(
		() =>
			fields.map((field, index) => ({
				...field,
				groups:
					field.items?.map((group) => group.label).join(", ") ??
					i18n.t("N/A"),
				files:
					field.items?.map((file) => file.label).join(", ") ??
					i18n.t("N/A"),
				actions: (
					<ButtonStrip>
						<EditDocumentGroup
							onUpdate={(data) => update(index, data)}
							group={field}
						/>
						<DeleteDocumentGroup
							onRemove={() => remove(index)}
							group={field}
						/>
					</ButtonStrip>
				),
			})),
		[fields],
	);
	if (!hasGroups) {
		return null;
	}
	const handleSortSubmit = (sortedItems: DocumentGroup[]) => {
			replace(sortedItems);
		};

	return (
		<Field>
			<div className="flex flex-col gap-4 pt-4">
				<div className="flex flex-row gap-4 justify-between">
					<h3 className="text-2xl">{i18n.t("Groups")}</h3>
					<ButtonStrip end>
						<SortDocumentGroup items={fields} onSortSubmit={handleSortSubmit} />
						<AddDocumentGroup onAdd={append} sortOrder={fields.length + 1}/>
					</ButtonStrip>
				</div>
				<SimpleTable
					emptyLabel={i18n.t(
						"There are no document configuration present",
					)}
					columns={columns}
					rows={rows}
				/>
			</div>
		</Field>
	);
}
