import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../shared/components/ModuleContainer";
import i18n from "@dhis2/d2-i18n";
import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, NoticeBox } from "@dhis2/ui";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { AppearanceConfig } from "../../shared/components/appearance/AppearanceConfig/AppearanceConfig";
import { MissingAppearanceConfig } from "../../shared/components/appearance/MissingAppearanceConfig";

const query = {
	appearanceConfig: {
		resource: "dataStore",
		id: "hisptz-public-portal/appearance",
	},
};

type QueryResult = {
	appearanceConfig: AppAppearanceConfig;
};

export const Route = createLazyFileRoute("/appearance/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { loading, data, error } = useDataQuery<QueryResult>(query);

	if (error) {
		return (
			<NoticeBox
				title={i18n.t("Could not get Appearance configurations")}
			>
				{
					<div className="flex flex-col gap-2">
						<p>
							{i18n.t("Error")}: {error.message}
						</p>
					</div>
				}
			</NoticeBox>
		);
	}

	const { appearanceConfig } = data ?? {};

	return (
		<ModuleContainer title="Appearance">
			{loading ? (
				<div className="flex justify-center items-center h-50">
					<CircularLoader />
				</div>
			) : appearanceConfig ? (
				<AppearanceConfig appearanceConfig={appearanceConfig} />
			) : (
				<MissingAppearanceConfig
					onAddConfigurations={() =>
						console.log("Add configurations")
					}
				/>
			)}
		</ModuleContainer>
	);
}
