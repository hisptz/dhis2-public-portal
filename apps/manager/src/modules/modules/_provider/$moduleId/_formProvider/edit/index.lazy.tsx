import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import { useModule } from "../../../../../../shared/components/ModulesPage/providers/ModuleProvider";
import ErrorPage from "../../../../../../shared/components/ErrorPage/ErrorPage";
import { DashboardConfigPage } from "../../../../../../shared/components/VisualizationModule/DashboardConfigPage";
import { PageHeader } from "../../../../../../shared/components/PageHeader";
import { DeleteModule } from "../../../../../../shared/components/ModulesPage/components/DeleteModule";
import { ModuleEditActions } from "../../../../../../shared/components/ModulesPage/components/ModuleEditActions";
import { ModuleType } from "@packages/shared/schemas";
import { StaticConfigPage } from "../../../../../../shared/components/StaticModule/StaticConfigPage";
import { SectionConfigPage } from "../../../../../../shared/components/SectionModule/SectionConfigPage";

export const Route = createLazyFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const module = useModule();
	const navigate = useNavigate();

	if (!module) {
		return <ErrorPage error={Error("Module not found")} />;
	}

	const renderModulePage = () => {
		switch (module.type) {
			case ModuleType.VISUALIZATION:
				return <DashboardConfigPage />;
			case ModuleType.STATIC:
				return <StaticConfigPage />;
			case ModuleType.SECTION:
				return <SectionConfigPage />;
			default:
				return (
					<ErrorPage
						error={new Error(i18n.t("Unknown module type"))}
					/>
				);
		}
	};
	return (
		<div className="h-full w-full flex flex-col gap-2">
			<div>
				<Button
					onClick={() => {
						navigate({ to: "/modules" });
					}}
					icon={<IconArrowLeft24 />}
				>
					{i18n.t("Back to all modules")}
				</Button>
			</div>
			<PageHeader
				title={`${i18n.t("Module")} - ${module.label}`}
				actions={
					<div className="flex gap-4 items-center">
						<DeleteModule />
						<ModuleEditActions />
					</div>
				}
			/>
			{renderModulePage()}
		</div>
	);
}
