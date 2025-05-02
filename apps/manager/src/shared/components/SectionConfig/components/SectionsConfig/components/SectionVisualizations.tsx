import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { DisplayItem, DisplayItemType } from "@packages/shared/schemas";

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
		label: i18n.t("Caption"),
		key: "caption",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function SectionVisualizations({
	visualizations,
}: {
	visualizations: Array<DisplayItem & { actions: React.ReactNode }>;
}) {
	const rows = visualizations.map((vis) => {
		if (vis.type === DisplayItemType.VISUALIZATION) {
			return {
				id: vis.item.id,
				type: vis.item.type,
				caption: vis.item.caption || "N/A",
				actions: vis.actions,
			};
		} else {
			return {
				id: vis.item.id,
				type: DisplayItemType.SINGLE_VALUE,
				caption: "Single Value",
				actions: vis.actions,
			};
		}
	});

	return <SimpleTable columns={columns} rows={rows} />;
}
