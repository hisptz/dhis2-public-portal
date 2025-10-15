import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { useDataSources } from "../providers/DataSourcesProvider";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RunConfigStatus } from "./RunConfiguration/components/RunConfigStatus/RunConfigStatus";
import { AddDataSource } from "./AddDataSource";
import { ActionsMenu } from "./ActionsMenu";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Name"),
		key: "name",
	},
	{
		label: i18n.t("Latest Status"),
		key: "status",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function ConfigurationList() {
	const configurations = useDataSources();

	const rows = configurations.map((configuration) => ({
		...configuration,
		name: configuration.source.name,
	    status: <RunConfigStatus configId={configuration.id} />,
		actions: <ActionsMenu config={configuration} />,
	}));

	return (
		<div className="flex flex-col gap-8">
		<div className="flex justify-end"><AddDataSource /> </div>
		<SimpleTable
			rows={rows}
			emptyLabel="There are no configuration present"
			columns={columns}
		/>
		</div>
		
	);
}
