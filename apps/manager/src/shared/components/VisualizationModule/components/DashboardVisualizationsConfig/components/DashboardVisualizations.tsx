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
	} 
];

export function DashboardVisualizations({
	visualizations,
}: {
	visualizations: VisualizationItem[];
}) {
	return <SimpleTable columns={columns} rows={visualizations} />;
}
