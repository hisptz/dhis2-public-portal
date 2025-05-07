import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { DocumentItem, VisualizationItem } from "@packages/shared/schemas";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Label"),
		key: "label",
	},
	{
		label: i18n.t("File"),
		key: "file",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

type DocumentRow = DocumentItem & {
	actions: React.ReactNode;
};

export function DocumentItemListConfig({
	Documents,
}: {
	Documents: DocumentRow[];
}) {
	return <SimpleTable columns={columns} rows={Documents} />;
}
