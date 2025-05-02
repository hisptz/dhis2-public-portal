import React from "react";
import i18n from "@dhis2/d2-i18n";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { VisualizationItem } from "@packages/shared/schemas";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Label"),
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

type VisualizationRow = VisualizationItem & {
	id: string;
	actions: React.ReactNode;
};

export function GroupVisualizations({
	visualizations,
}: {
	visualizations: VisualizationRow[];
}) {
	const rows = visualizations.map((vis) => ({
		id: vis.id,
		type: vis.type,
		caption: vis.caption || "N/A",
		actions: vis.actions,
	}));

	return <SimpleTable columns={columns} rows={rows} />;
}