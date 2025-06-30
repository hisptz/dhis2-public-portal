import { useDataQuery } from "@dhis2/app-runtime";
import React, { useMemo } from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

const visQuery = {
	vis: {
		resource: "visualizations",
		params: () => {
			return {
				fields: ["id", "displayName", "type"],
				order: "name:asc",
				paging: false,
				filter: `type:eq:SINGLE_VALUE`,
			};
		},
	},
};

type VisualizationQueryResponse = {
	vis: {
		visualizations: Array<{
			id: string;
			displayName: string;
			type: string;
		}>;
	};
};

export function VisSelector() {
	const { data, loading } = useDataQuery<VisualizationQueryResponse>(
		visQuery as any,
	);
	const options = useMemo(
		() =>
			data?.vis?.visualizations.map(({ id, displayName, type }) => ({
				label: `${displayName}`,
				value: id,
				type: type,
			})) ?? [],
		[data?.vis?.visualizations],
	);

	return (
		<div className="flex flex-col gap-4 ">
			<RHFSingleSelectField
				required
				dataTest={"single-value-visualization-select"}
				disabled={loading}
				label={i18n.t("Single value visualization")}
				loading={loading}
				options={options}
				name={"id"}
			/>
		</div>
	);
}

export function VisualizationSelector() {
	return <VisSelector />;
}
