import React, { useMemo } from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { AppMenuConfig, MenuItemType } from "@packages/shared/schemas";
import { capitalize, snakeCase } from "lodash";
import { useFieldArray } from "react-hook-form";
import { AddMenuItem } from "./AddMenuItem";
import { ButtonStrip } from "@dhis2/ui";
import { EditMenuItem } from "./EditMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Name"),
		key: "label",
	},
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Modules"),
		key: "modules",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function MenuList() {
	const { fields, append, update, remove } = useFieldArray<
		AppMenuConfig,
		"items"
	>({
		name: "items",
	});

	const rows = useMemo(() => {
		return fields.map((item, index) => {
			return {
				...item,
				id: item.label,
				type: capitalize(snakeCase(item.type)),
				modules:
					item.type === MenuItemType.GROUP
						? item.items.map((item) => item.label).join(", ")
						: i18n.t("N/A"),
				actions: (
					<ButtonStrip>
						<EditMenuItem
							onUpdate={(menu) => {
								update(index, menu);
							}}
							item={item}
						/>
						<DeleteMenuItem
							item={item}
							onDelete={() => remove(index)}
						/>
					</ButtonStrip>
				),
			};
		});
	}, [fields, remove, update]);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h4>{i18n.t("Menu items")}</h4>
				<AddMenuItem onAdd={append} sortOrder={fields.length + 1} />
			</div>
			<SimpleTable columns={columns} rows={rows} />
		</div>
	);
}
