import { useFieldArray } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { startCase } from "lodash";
import { FixedPeriodType } from "@hisptz/dhis2-utils";
import { ButtonStrip } from "@dhis2/ui";
import React from "react";
import { AddDataItemConfig } from "./AddDataItemConfig/AddDataItemConfig";
import { EditDataItemConfig } from "./AddDataItemConfig/EditDataItemConfig";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("ID"),
		key: "id",
	},
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Period Type"),
		key: "periodType",
	},

	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function DataItemsList() {
	const { fields, append, update } = useFieldArray<
		DataServiceConfig,
		"itemsConfig"
	>({
		name: "itemsConfig",
		keyName: "fieldId" as unknown as "id",
	});

	const rows = fields.map((item, index) => ({
		...item,
		type: startCase(item.type.toLowerCase()),
		periodType: FixedPeriodType.getFromId(item.periodTypeId, {}).config
			.name,
		actions: (
			<ButtonStrip>
				<EditDataItemConfig
					config={item}
					onUpdate={(data) => update(index, data)}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<div className="flex flex-col gap-4 w-full">
			<ButtonStrip end>
				<AddDataItemConfig onAdd={append} />
			</ButtonStrip>
			<SimpleTable
				columns={columns}
				rows={rows}
				emptyLabel={i18n.t("There are no data items present")}
			/>
		</div>
	);
}
