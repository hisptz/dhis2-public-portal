import React from "react";
import { SimpleDataTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Section } from "@packages/shared/schemas";
import { startCase } from "lodash";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Title"),
		key: "title",
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

export function Sections({ sections }: { sections: Section[] }) {
	const rows = sections.map((section) => ({
		...section,
		type: startCase(section?.type?.toLowerCase()),
	}));

	return <SimpleDataTable columns={columns} rows={rows} />;
}
