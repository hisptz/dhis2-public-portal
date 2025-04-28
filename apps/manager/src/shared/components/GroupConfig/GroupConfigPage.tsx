import React from "react";
import { GroupGeneralConfig } from "./components/GroupGeneralConfig";
// import { SubGroupsConfig } from "./components/SubGroupsConfig/SubGroupsConfig";
import { GroupVisualizationsConfig } from "./components/GroupVisualizationsConfig/GroupVisualizationsConfig";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useWatch } from "react-hook-form";
import { DashboardGroupEditActions } from "../VisualizationModule/components/DashboardGroupEditActions";
import { PageHeader } from "../PageHeader";
import { AppModule } from "@packages/shared/schemas";

function GroupPageHeader() {
	const { groupIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/",
	});
	const label = useWatch<AppModule, `config.groups.${number}.title`>({
		name: `config.groups.${groupIndex}.title`,
	});

	return (
		<PageHeader
			title={`${i18n.t("Dashboard group")} - ${label}`}
			actions={<DashboardGroupEditActions />}
		/>
	);
}

export function GroupConfigPage() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/",
	});

	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/$groupIndex",
	});

	return (
		<div className="flex flex-col gap-6 w-full h-full">
			<div>
				<Button
					onClick={() => {
						navigate({
							to: "/modules/$moduleId/edit",
							params: { moduleId },
						});
					}}
					icon={<IconArrowLeft24 />}
				>
					{i18n.t("Back to dashboard ")}
				</Button>
			</div>
			<GroupPageHeader />
			<GroupGeneralConfig />
			<GroupVisualizationsConfig />
		</div>
	);
}
