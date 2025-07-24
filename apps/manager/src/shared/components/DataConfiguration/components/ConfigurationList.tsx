import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { useDataSources } from "../providers/DataSourcesProvider";
import React from "react";
import { Button, ButtonStrip, IconSettings16, Tooltip } from "@dhis2/ui";
import { useNavigate } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";
import { RunConfiguration } from "./RunConfiguration/RunConfiguration";
import { RunConfigStatus } from "./RunConfiguration/components/RunConfigStatus/RunConfigStatus";
import { RunConfigSummary } from "./RunConfiguration/components/RunConfigSummary/RunConfigSummary";
import { AddDataSource } from "./AddDataSource";

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
	const navigate = useNavigate({
		from: "/data-service-configuration/",
	});

	const rows = configurations.map((configuration) => ({
		...configuration,
		name: configuration.source.name,
		status: <RunConfigStatus configId={configuration.id} />,
		actions: (
			<ButtonStrip>
				<Tooltip content={i18n.t("Edit configuration")}>
					<Button
						small
						onClick={() => {
							navigate({
								to: "/data-service-configuration/$configId",
								params: {
									configId: configuration.id,
								},
							});
						}}
						icon={<IconSettings16 />}
					/>
				</Tooltip>
				<RunConfiguration config={configuration} />
				<RunConfigSummary config={configuration} />
			</ButtonStrip>
		),
	}));

	return (
		<>
		<div className="flex justify-end"><AddDataSource /> </div>
		<SimpleTable
			rows={rows}
			emptyLabel="There are no configuration present"
			columns={columns}
		/>
		</>
		
	);
}
