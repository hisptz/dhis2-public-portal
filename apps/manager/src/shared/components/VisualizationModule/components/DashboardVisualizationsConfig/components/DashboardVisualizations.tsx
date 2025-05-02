import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
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
	actions: React.ReactNode;
};

export function DashboardVisualizations({
	visualizations,
}: {
	visualizations: VisualizationRow[];
}) {
	return <SimpleTable columns={columns} rows={visualizations} />;
}
