import { useBoolean } from "usehooks-ts";
import { AddDashboardForm } from "./components/AddDashboardForm";
import React from "react";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRefreshModules } from "../../../ModulesPage/providers/ModulesProvider";
import { VisualizationModuleConfig } from "@packages/shared/schemas";

export function AddDashboard() {
	const refreshDashboards = useRefreshModules();
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddDashboardForm
					onComplete={(dashboard: VisualizationModuleConfig) => {
						refreshDashboards();
					// TODO: Implement navigation logic here
					}}
					hide={hide}
					onClose={onHide}
				/>
			)}
			<Button icon={<IconAdd24 />} primary onClick={onShow}>
				{i18n.t("Create a new dashboard")}
			</Button>
		</>
	);
}
