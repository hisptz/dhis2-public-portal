import React, { useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { LibraryData } from "@packages/shared/schemas";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ButtonStrip, Field } from "@dhis2/ui";
import { AddLibraryGroup } from "./components/AddLibraryGroup";
import { EditLibraryGroup } from "./components/EditLibraryGroup";
import { DeleteLibraryGroup } from "./components/DeleteLibraryGroup";

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

export function LibraryGroupConfig() {
	const { fields, append, update, remove } = useFieldArray<
		LibraryData,
		"groups"
	>({
		name: "groups",
		keyName: "key" as unknown as "id",
	});

	const rows = useMemo(
		() =>
			fields.map((field, index) => ({
				...field,
				groups:
					field.subGroups?.map((group) => group.label).join(", ") ??
					i18n.t("N/A"),
				files:
					field.files?.map((file) => file.label).join(", ") ??
					i18n.t("N/A"),
				actions: (
					<ButtonStrip>
						<EditLibraryGroup
							onUpdate={(data) => update(index, data)}
							group={field}
						/>
						<DeleteLibraryGroup
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
					<AddLibraryGroup onAdd={append} />
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
