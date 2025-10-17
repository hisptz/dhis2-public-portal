import { useWatch } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import React, { useEffect } from "react";
import i18n from "@dhis2/d2-i18n";
import { CircularLoader } from "@dhis2/ui";
import { FormTestConnection } from "./FormTestConnection";
import { EditConnectionButton } from "./EditConnectionButton";
import { useRoute } from "../hooks/useRoute";

export function SourceConfiguration() {
	const source = useWatch<DataServiceConfig, "source">({
		name: "source",
	});
	
	const { loading, route, error, refetch } = useRoute(source?.routeId);

	useEffect(() => {
		if (source?.routeId) {
			refetch();
		}
	}, [source?.name, source?.routeId, refetch]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-row items-center gap-2">
				<span className="text-base font-semibold text-gray-700 min-w-[80px]">
					{i18n.t("Name")}:
				</span>
				<span className="text-base text-gray-900">{source.name}</span>
			</div>
			{loading ? (
				<div className="flex items-center gap-2">
					<CircularLoader small />
					<span className="text-base text-gray-500">
						{i18n.t("Loading connection details...")}
					</span>
				</div>
			) : error ? (
				<div className="flex flex-row items-center gap-2">
					<span className="text-base text-gray-400">
						{i18n.t("Could not get source information")}
					</span>
				</div>
			) : (
				<>
					<div className="flex flex-row items-center gap-2">
						<span className="text-base font-semibold text-gray-700 min-w-[80px]">
							{i18n.t("URL")}:
						</span>
						<a
							href={route?.url.replace("/api/**", "")}
							target="_blank"
							rel="noopener noreferrer"
							className="text-base text-blue-600 hover:text-blue-800 hover:underline"
						>
							{route?.url.replace("/api/**", "")}
						</a>
					</div>
					<div className="flex gap-2 items-center pt-2 ">

						<EditConnectionButton />
						{route && (
							<FormTestConnection routeConfig={route} />
						)}
					</div>
				</>
			)}
		</div>
	);
}
