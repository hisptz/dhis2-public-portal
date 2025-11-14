import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { useDataSources } from "../providers/DataSourcesProvider";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RunConfigStatus } from "./RunConfiguration/components/RunConfigStatus/RunConfigStatus";
import { AddDataSource } from "./AddDataSource";
import { ActionsMenu } from "./ActionsMenu";
import { useRoutes } from "../hooks/useRoutes";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Name"),
		key: "name",
	},
	{
		label: i18n.t("URL"),
		key: "url",
	},
	{
		label: i18n.t("Latest Migration Status"),
		key: "status",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function ConfigurationList() {
	const configurations = useDataSources();
	const { routes } = useRoutes();

	const rows = configurations.map((configuration) => {
		const route = routes.find((r) => r.id === configuration.source.routeId);
		const url = route?.url?.replace("/api/**", "") || configuration.source.routeId;

		return {
			...configuration,
			name: configuration.source.name,
			url,
			status: <RunConfigStatus configId={configuration.id} />,
			actions: <ActionsMenu config={configuration} />,
		};
	});

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
