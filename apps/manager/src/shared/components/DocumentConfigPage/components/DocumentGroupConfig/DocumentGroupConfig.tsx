import React, { useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { DocumentsModule } from "@packages/shared/schemas";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ButtonStrip, Field } from "@dhis2/ui";
import { AddDocumentGroup } from "./components/AddDocumentGroup";
import { EditDocumentGroup } from "./components/EditDocumentGroup";
import { DeleteDocumentGroup } from "./components/DeleteDocumentGroup";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Label"),
		key: "label",
	},
	{
		label: i18n.t("Sub groups"),
		key: "groups",
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
	const { fields, append, update, remove } = useFieldArray<
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

	return (
		<Field label={i18n.t("Groups")}>
			<div className="flex flex-col gap-4">
				<ButtonStrip end>
					<AddDocumentGroup onAdd={append} />
				</ButtonStrip>
				<SimpleTable
					emptyLabel={i18n.t(
						"There are no library configuration present",
					)}
					columns={columns}
					rows={rows}
				/>
			</div>
		</Field>
	);
}
