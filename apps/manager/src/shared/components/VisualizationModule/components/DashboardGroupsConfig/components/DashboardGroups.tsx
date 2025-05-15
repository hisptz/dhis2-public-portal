import React, { ReactElement } from "react";
import { SimpleDataTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { VisualizationGroup} from "@packages/shared/schemas";


type VisualizationGroupWithUI = Omit<VisualizationGroup, 'description' | 'shortDescription'> & {
  description?: ReactElement;
  shortDescription?: ReactElement;
};

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Title"),
		key: "title",
	},
	{
		label: i18n.t("Short description"),
		key: "shortDescription",
	},
	{
		label: i18n.t("Description"),
		key: "description",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function DashboardGroups({ groups }: { groups: VisualizationGroupWithUI[] }) {
	const rows = groups.map((group) => ({
		...group,
	}));

	return <SimpleDataTable columns={columns} rows={rows} />;
}
