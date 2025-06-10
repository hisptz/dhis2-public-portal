import React from "react";
import { DashboardGroupsConfig } from "./components/DashboardGroupsConfig/DashboardGroupsConfig";
import { DashboardVisualizationsConfig } from "./components/DashboardVisualizationsConfig/DashboardVisualizationsConfig";
import { DashboardGeneralConfig } from "./components/DashboardGeneralConfig";

export function DashboardConfigPage() {
	return (
		<div className="flex flex-col gap-6 pb-4">
			<DashboardGeneralConfig />
			<DashboardGroupsConfig />
			<DashboardVisualizationsConfig />
		</div>
	);
}
