import { useWatch } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader } from "@dhis2/ui";
import { FormTestConnection } from "./FormTestConnection";

const routeQuery: any = {
	route: {
		resource: "routes",
		id: ({ id }: { id: string }) => id,
	},
};

interface QueryResponse {
	route: {
		id: string;
		name: string;
		url: string;
	};
}

export function SourceConfiguration() {
	const source = useWatch<DataServiceConfig, "source">({
		name: "source",
	});
	const { loading, data, error } = useDataQuery<QueryResponse>(routeQuery, {
		variables: {
			id: source.routeId,
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<RHFTextInputField
				required
				name="source.name"
				label={i18n.t("Name")}
			/>
			{loading ? (
				<div>
					<CircularLoader small />
				</div>
			) : error ? (
				<div>
					<span className="text-sm text-gray-400">
						{i18n.t("Could not get source information")}
					</span>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<span className="text-sm">
						<b>{i18n.t("URL")}: </b>
						{data?.route?.url.replace("/api/**", "")}
					</span>
					{data?.route && (
						<FormTestConnection routeConfig={data?.route} />
					)}
				</div>
			)}
		</div>
	);
}
