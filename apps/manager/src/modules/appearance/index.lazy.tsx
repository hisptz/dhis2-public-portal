import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, NoticeBox } from "@dhis2/ui";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { AppearanceConfig } from "../../shared/components/appearance/AppearanceConfig/AppearanceConfig";
import { MissingAppearanceConfig } from "../../shared/components/appearance/MissingAppearanceConfig";
import {
	APP_NAMESPACE,
	APPEARANCE_CONFIG_KEY,
} from "../../shared/constants/datastore";

const query = {
	appearanceConfig: {
		resource: "dataStore",
		id: `${APP_NAMESPACE}/${APPEARANCE_CONFIG_KEY}`,
	},
};

type QueryResult = {
	appearanceConfig: AppAppearanceConfig;
};

export const Route = createLazyFileRoute("/appearance/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { loading, data, error, refetch } = useDataQuery<QueryResult>(query);

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
				<AppearanceConfig
					appearanceConfig={appearanceConfig}
					refetchConfig={refetch}
				/>
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
