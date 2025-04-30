import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { DocumentGroup } from "@packages/shared/schemas";
import { useFieldArray } from "react-hook-form";
import { ButtonStrip, Field } from "@dhis2/ui";
import React, { useMemo } from "react";
import { EditDocumentGroup } from "../EditDocumentGroup";
import { AddDocumentGroup } from "../AddDocumentGroup";
import { DeleteDocumentGroup } from "../DeleteDocumentGroup";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Label"),
		key: "label",
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

export function SubGroupsListForm() {
	const { fields, append, update, remove } = useFieldArray<
		DocumentGroup,
		"items"
	>({
		name: "items",
		keyName: "key" as unknown as "id",
	});

	const rows = useMemo(() => {
		return fields.map((field, index) => ({
			...field,
			files: field?.map((file) => file.label).join(", "),
			actions: (
				<ButtonStrip>
					<EditDocumentGroup
						onUpdate={(dgroupata) => update(index, data)}
						group={field}
					/>
					<DeleteDocumentGroup
						group={field}
						onRemove={() => remove(index)}
					/>
				</ButtonStrip>
			),
		}));
	}, [fields]);

	return (
		<Field required label={i18n.t("Sub groups")}>
			<div className="flex flex-col gap-2">
				<ButtonStrip end>
					<AddDocumentGroup nested onAdd={append} />
				</ButtonStrip>
				<SimpleTable
					emptyLabel={i18n.t("There are no sub groups present")}
					columns={columns}
					rows={rows}
				/>
			</div>
		</Field>
	);
}
