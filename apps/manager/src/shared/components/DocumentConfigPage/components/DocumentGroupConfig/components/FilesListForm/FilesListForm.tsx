import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { useFieldArray } from "react-hook-form";
import { DocumentGroup } from "@packages/shared/schemas";
import React, { useMemo } from "react";
import i18n from "@dhis2/d2-i18n";
import { ButtonStrip, Field } from "@dhis2/ui";
import { AddFile } from "./components/AddFile";
import { DeleteFile } from "./components/DeleteFile";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Label"),
		key: "label",
	},
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function FilesListForm({ nested }: { nested?: boolean }) {
	const { fields, append, remove } = useFieldArray<DocumentGroup, "items">({
		name: "items",
		keyName: "key" as unknown as "id",
	});

	const rows = useMemo(() => {
		return fields.map((field, index) => ({
			...field,
			actions: (
				<ButtonStrip>
					<DeleteFile file={field} onRemove={() => remove(index)} />
				</ButtonStrip>
			),
		}));
	}, [fields]);

	return (
		<Field label={i18n.t("Files")}>
			<div className="flex flex-col gap-2">
				<ButtonStrip end>
					<AddFile nested={nested} onAdd={append} />
				</ButtonStrip>
				<SimpleTable
					emptyLabel={i18n.t("There are no files present")}
					columns={columns}
					rows={rows}
				/>
			</div>
		</Field>
	);
}
